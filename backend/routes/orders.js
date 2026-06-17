// backend/routes/orders.js
const express  = require('express');
const db       = require('../../database/db');
const ws       = require('../ws');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const router   = express.Router();
const STATUS_SEQ = ['pending','preparing','ready','delivery','done'];
const DINE_FLOW   = ['pending','preparing','ready','done'];

// GET /api/orders  — admin voit tout, client voit les siennes
router.get('/', authMiddleware, (req, res) => {
  let orders = db.get('orders').value();
  if (req.user.role === 'client') {
    orders = orders.filter(o => o.clientId === req.user.id);
  } else {
    const { status, type, filter } = req.query;
    if (filter === 'first')      orders = orders.filter(o => o.isFirst);
    else if (status)             orders = orders.filter(o => o.status === status);
    if (type)                    orders = orders.filter(o => o.type === type);
  }
  orders.sort((a,b) => {
    if (a.isFirst && !b.isFirst) return -1;
    if (!a.isFirst && b.isFirst) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json(orders);
});

// GET /api/orders/stats
router.get('/stats', authMiddleware, (req, res) => {
  let orders = db.get('orders').value();
  if (req.user.role === 'client') orders = orders.filter(o => o.clientId === req.user.id);
  const done    = orders.filter(o => o.status === 'done');
  const pending = orders.filter(o => o.status === 'pending');
  const deliv   = orders.filter(o => o.type   === 'delivery');
  const active  = orders.filter(o => ['pending','preparing'].includes(o.status));
  res.json({ total:orders.length, revenue:done.reduce((s,o)=>s+o.price,0), deliveries:deliv.length, pending:pending.length, activeCount:active.length });
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  if (req.user.role === 'client' && order.clientId !== req.user.id)
    return res.status(403).json({ error:'Accès refusé' });
  res.json(order);
});

// POST /api/orders  — accessible admin + client connecté + client anonyme (sur place)
router.post('/', optionalAuth, (req, res) => {
  const { client, items, type, address, note, tableNumber, lat, lng, deliveryFee, distance } = req.body;
  if (!client || !items || items.length === 0)
    return res.status(400).json({ error:'Client et plats requis' });
  if (type === 'delivery' && !address)
    return res.status(400).json({ error:'Adresse requise pour les livraisons' });

  const dishes = db.get('dishes').value();
  let price = 0;
  const itemNames = [];
  for (const itemName of items) {
    const dish = dishes.find(d => d.name === itemName && d.available);
    if (!dish) return res.status(400).json({ error:`Plat indisponible : ${itemName}` });
    price += dish.price;
    itemNames.push(dish.name);
  }

  const meta  = db.get('meta').value();
  const newId = meta.orderCounter + 1;
  db.get('meta').assign({ orderCounter:newId }).write();

  const now    = new Date();
  const time   = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const order  = {
    id:newId, client, clientId: req.user?.id || null,
    items:itemNames, status:'pending', type:type||'dine', time, price, isFirst:false,
    address: type==='delivery' ? address : null,
    lat: type==='delivery' ? (lat||null) : null,
    lng: type==='delivery' ? (lng||null) : null,
    deliveryFee: type==='delivery' ? (+deliveryFee||0) : 0,
    distance: type==='delivery' ? (+distance||0) : 0,
    deliveryStep:0, note:note||'', tableNumber: tableNumber ? +tableNumber : null,
    createdAt:now.toISOString(), updatedAt:now.toISOString(),
  };
  db.get('orders').push(order).write();

  if (order.tableNumber && type === 'dine') {
    const table = db.get('tables').find({ id: order.tableNumber }).value();
    if (table) {
      db.get('tables').find({ id: order.tableNumber }).assign({ status: 'occupied' }).write();
      ws.broadcast('table:updated', { ...table, status: 'occupied' });
    }
  }

  ws.broadcast('order:new', order);
  res.status(201).json(order);
});

// PATCH /api/orders/:id/advance  — admin et staff
router.patch('/:id/advance', authMiddleware, (req, res) => {
  if (!['admin','staff'].includes(req.user.role)) return res.status(403).json({ error:'Accès refusé' });
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  if (order.status === 'done') return res.status(400).json({ error:'Commande déjà terminée' });
  let next;
  if (order.type === 'dine') {
    const dineFlow = ['pending','preparing','ready','done'];
    const idx = dineFlow.indexOf(order.status);
    if (idx < 0 || idx >= dineFlow.length-1) return res.status(400).json({ error:'Statut final' });
    next = dineFlow[idx+1];
  } else {
    if (order.status === 'ready') next = 'delivery';
    else {
      const idx = STATUS_SEQ.indexOf(order.status);
      if (idx < 0 || idx >= STATUS_SEQ.length-1) return res.status(400).json({ error:'Statut final' });
      next = STATUS_SEQ[idx+1];
    }
  }
  db.get('orders').find({ id:order.id }).assign({ status:next, updatedAt:new Date().toISOString() }).write();
  const updated = db.get('orders').find({ id:order.id }).value();
  ws.broadcast('order:updated', updated);

  if (next === 'done' && updated.tableNumber) {
    const activeOnTable = db.get('orders').filter({ tableNumber: updated.tableNumber }).reject({ status:'done' }).value();
    if (activeOnTable.length === 0) {
      db.get('tables').find({ id: updated.tableNumber }).assign({ status:'free' }).write();
      const tbl = db.get('tables').find({ id: updated.tableNumber }).value();
      ws.broadcast('table:updated', tbl);
    }
  }

  res.json(updated);
});

// PATCH /api/orders/:id/delivery-step  — admin et staff
router.patch('/:id/delivery-step', authMiddleware, (req, res) => {
  if (!['admin','staff'].includes(req.user.role)) return res.status(403).json({ error:'Accès refusé' });
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  const nextStep = (order.deliveryStep||0)+1;
  const updates  = { deliveryStep:nextStep, updatedAt:new Date().toISOString() };
  if (nextStep >= 3) updates.status = 'done';
  db.get('orders').find({ id:order.id }).assign(updates).write();
  const updated = db.get('orders').find({ id:order.id }).value();
  ws.broadcast('order:updated', updated);
  res.json(updated);
});

// PATCH /api/orders/:id/pay  — client propriétaire ou admin/staff
router.patch('/:id/pay', authMiddleware, (req, res) => {
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  if (req.user.role === 'client') {
    if (order.clientId !== req.user.id) return res.status(403).json({ error:'Accès refusé' });
    if (order.status !== 'ready') return res.status(400).json({ error:'La commande doit être prête pour payer' });
  }
  const phone = (req.body || {}).phone || '';
  const ref = 'MVola-' + Date.now().toString(36).toUpperCase() + '-' + order.id;
  const nextStatus = order.type === 'delivery' ? 'delivery' : 'done';
  db.get('orders').find({ id:order.id }).assign({
    status:nextStatus, paid:true, paidAt:new Date().toISOString(),
    paidBy: phone, paymentRef: ref, updatedAt:new Date().toISOString()
  }).write();
  const updated = db.get('orders').find({ id:order.id }).value();
  // Historique paiements
  db.get('payments').push({
    id: Date.now(), orderId: order.id, ref, phone,
    amount: order.price, client: order.client, items: order.items,
    type: order.type, tableNumber: order.tableNumber || null,
    createdAt: new Date().toISOString()
  }).write();
  ws.broadcast('order:updated', updated);
  ws.broadcast('payment:received', { orderId:order.id, ref, phone, amount:order.price, client:order.client, items:order.items, type:order.type });
  res.json(updated);
});

// DELETE /api/orders/:id  — admin ou propriétaire (si pending)
router.delete('/:id', authMiddleware, (req, res) => {
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  if (req.user.role === 'client') {
    if (order.clientId !== req.user.id) return res.status(403).json({ error:'Accès refusé' });
    if (order.status !== 'pending') return res.status(400).json({ error:'Impossible d\'annuler une commande déjà en cours' });
  }
  db.get('orders').remove({ id:+req.params.id }).write();
  ws.broadcast('order:deleted', { id:+req.params.id });
  res.json({ message:'Commande annulée' });
});

// GET /api/orders/:id/receipt — PDF reçu de paiement
router.get('/:id/receipt', authMiddleware, (req, res) => {
  const order = db.get('orders').find({ id:+req.params.id }).value();
  if (!order) return res.status(404).json({ error:'Commande introuvable' });
  if (!order.paid) return res.status(400).json({ error:'Commande non payée' });
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size:'A5', margin:0 });
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition','inline; receipt-'+order.id+'.pdf');
  doc.pipe(res);

  const W = doc.page.width;
  const M = 30;
  const CW = W - M*2;
  let y = 0;

  // ── Bande verte en haut ──
  doc.rect(0, 0, W, 70).fill('#1557b0');
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#fff').text('T-isakafo', M, 18, { width:CW, align:'center' });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.7)').text('Restaurant Malgache d\'Exception', M, 44, { width:CW, align:'center' });

  y = 82;

  // ── Titre reçu ──
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#1c1b1b').text('REÇU DE PAIEMENT', M, y, { width:CW, align:'center' });
  y = doc.y + 12;

  // ── Carte infos ──
  const cardY = y;
  doc.roundedRect(M, cardY, CW, 72, 4).fill('#f5f5f5');
  let iy = cardY + 12;
  const ref = order.paymentRef || 'N/A';
  const phone = order.paidBy || 'N/A';
  const paidAt = order.paidAt ? new Date(order.paidAt).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR');
  const typeLabel = order.type === 'delivery' ? 'Livraison' : 'Sur place';

  const drawRow = (label, value, yPos) => {
    doc.fontSize(8).font('Helvetica').fillColor('#888').text(label, M+12, yPos, { continued:false });
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1c1b1b').text(value, M+100, yPos, { continued:false });
  };
  drawRow('Référence', ref, iy);
  drawRow('Téléphone', '+261 ' + phone, iy + 16);
  drawRow('Date', paidAt, iy + 32);
  drawRow('Type', typeLabel, iy + 48);

  y = cardY + 84;

  // ── Séparateur ──
  doc.moveTo(M, y).lineTo(W-M, y).stroke('#e0e0e0');
  y += 14;

  // ── Détail commande ──
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1557b0').text('DÉTAIL DE LA COMMANDE', M, y, { width:CW });
  y = doc.y + 4;
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('Commande #' + order.id + (order.tableNumber ? ' — Table T' + order.tableNumber : ''), M, y, { width:CW });
  y = doc.y + 10;

  // ── Items ──
  order.items.forEach((item, i) => {
    const bg = i % 2 === 0 ? '#fafafa' : '#fff';
    doc.rect(M, y - 2, CW, 16).fill(bg);
    doc.fontSize(8.5).font('Helvetica').fillColor('#1c1b1b').text('▸  ' + item, M + 8, y, { width:CW - 16 });
    y = doc.y + 2;
  });

  y += 6;
  doc.moveTo(M, y).lineTo(W-M, y).stroke('#e0e0e0');
  y += 12;

  // ── Total ──
  const totalStr = order.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  doc.roundedRect(M, y, CW, 28, 4).fill('#1557b0');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff').text('TOTAL', M + 12, y + 7, { continued:false });
  doc.text(totalStr + ' Ar', M, y + 7, { width:CW - 12, align:'right' });

  y += 44;

  // ── Pied de page ──
  doc.fontSize(7.5).font('Helvetica').fillColor('#999').text('Ce reçu atteste du paiement effectué via Mvola.', M, y, { width:CW, align:'center' });
  y = doc.y + 3;
  doc.text('Présentez ce reçu au livreur lors de la réception de votre commande.', M, y, { width:CW, align:'center' });
  y = doc.y + 10;

  // ── Bande verte en bas ──
  doc.rect(0, doc.page.height - 28, W, 28).fill('#1557b0');
  doc.fontSize(7).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('T-isakafo — ' + new Date().getFullYear(), M, doc.page.height - 20, { width:CW, align:'center' });

  doc.end();
});

module.exports = router;
