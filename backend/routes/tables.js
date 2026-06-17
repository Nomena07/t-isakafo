// backend/routes/tables.js — Gestion des tables et réservations
const express = require('express');
const db      = require('../../database/db');
const ws      = require('../ws');
const { authMiddleware } = require('../middleware/auth');
const router  = express.Router();

// GET /api/tables — Toutes les tables avec statut
router.get('/', authMiddleware, (req, res) => {
  const tables = db.get('tables').value();
  const orders = db.get('orders').value();
  const result = tables.map(t => {
    let orderInfo = null;
    if (t.orderId) {
      const o = orders.find(ord => ord.id === t.orderId);
      if (o) orderInfo = { id: o.id, client: o.client, items: o.items, status: o.status, price: o.price, time: o.time };
    }
    return { ...t, order: orderInfo };
  });
  res.json(result);
});

// GET /api/tables/free — Tables libres
router.get('/free', authMiddleware, (req, res) => {
  const tables = db.get('tables').filter({ status: 'free' }).value();
  res.json(tables);
});

// ── Réservations (AVANT /:id) ──

router.get('/reservations', authMiddleware, (req, res) => {
  let reservations = db.get('reservations').value();
  if (req.user.role === 'client') {
    reservations = reservations.filter(r => r.clientId === req.user.id);
  }
  res.json(reservations);
});

router.post('/reservations', authMiddleware, (req, res) => {
  const { tableId, date, time, guests, note } = req.body;
  if (!tableId || !date || !time || !guests) return res.status(400).json({ error: 'Table, date, heure et nombre d\'invités requis' });
  const table = db.get('tables').find({ id: +tableId }).value();
  if (!table) return res.status(404).json({ error: 'Table introuvable' });
  if (guests > table.seats) return res.status(400).json({ error: `Cette table ne dispose que de ${table.seats} places` });
  const meta = db.get('meta').value();
  const newId = (meta.reservationCounter || 0) + 1;
  db.get('meta').assign({ reservationCounter: newId }).write();
  const reservation = {
    id: newId, tableId: +tableId, tableName: table.name,
    clientId: req.user.id, client: req.user.name,
    date, time, guests: +guests, note: note || '',
    status: 'confirmed', createdAt: new Date().toISOString()
  };
  db.get('reservations').push(reservation).write();
  ws.broadcast('reservation:new', reservation);
  res.status(201).json(reservation);
});

router.delete('/reservations/:id', authMiddleware, (req, res) => {
  const reservation = db.get('reservations').find({ id: +req.params.id }).value();
  if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
  if (req.user.role === 'client' && reservation.clientId !== req.user.id)
    return res.status(403).json({ error: 'Accès refusé' });
  db.get('reservations').remove({ id: +req.params.id }).write();
  ws.broadcast('reservation:deleted', { id: +req.params.id });
  res.json({ message: 'Réservation annulée' });
});

// ── CRUD Tables (APRÈS /reservations) ──

router.post('/', authMiddleware, (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
  const { name, seats, x, y, zone } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  const meta = db.get('meta').value();
  const newId = (meta.tableCounter || 0) + 1;
  db.get('meta').assign({ tableCounter: newId }).write();
  const table = { id: newId, name, seats: parseInt(seats) || 4, x: parseInt(x) || 1, y: parseInt(y) || 1, zone: zone || 'Intérieur', status: 'free', orderId: null };
  db.get('tables').push(table).write();
  ws.broadcast('table:updated', table);
  res.status(201).json(table);
});

router.put('/:id', authMiddleware, (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
  const table = db.get('tables').find({ id: +req.params.id }).value();
  if (!table) return res.status(404).json({ error: 'Table introuvable' });
  const { name, seats, x, y, zone, status } = req.body;
  const updates = {};
  if (name !== undefined)  updates.name  = name;
  if (seats !== undefined) updates.seats = parseInt(seats);
  if (x !== undefined)     updates.x     = parseInt(x);
  if (y !== undefined)     updates.y     = parseInt(y);
  if (zone !== undefined)  updates.zone  = zone;
  if (status !== undefined) updates.status = status;
  db.get('tables').find({ id: +req.params.id }).assign(updates).write();
  const updated = db.get('tables').find({ id: +req.params.id }).value();
  ws.broadcast('table:updated', updated);
  res.json(updated);
});

router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  const table = db.get('tables').find({ id: +req.params.id }).value();
  if (!table) return res.status(404).json({ error: 'Table introuvable' });
  db.get('tables').remove({ id: +req.params.id }).write();
  ws.broadcast('table:deleted', { id: +req.params.id });
  res.json({ message: 'Table supprimée' });
});

router.patch('/:id/assign', authMiddleware, (req, res) => {
  const table = db.get('tables').find({ id: +req.params.id }).value();
  if (!table) return res.status(404).json({ error: 'Table introuvable' });
  const { orderId } = req.body;
  if (orderId) {
    db.get('tables').find({ id: +req.params.id }).assign({ status: 'occupied' }).write();
  } else {
    const activeOrders = db.get('orders').filter({ tableNumber: +req.params.id }).reject({ status:'done' }).value();
    if (activeOrders.length === 0) {
      db.get('tables').find({ id: +req.params.id }).assign({ status: 'free' }).write();
    }
  }
  const updated = db.get('tables').find({ id: +req.params.id }).value();
  ws.broadcast('table:updated', updated);
  res.json(updated);
});

module.exports = router;
