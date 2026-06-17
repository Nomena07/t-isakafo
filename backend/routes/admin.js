// backend/routes/admin.js — Routes super admin
const express = require('express');
const bcrypt  = require('bcryptjs');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../../database/db');
const ws      = require('../ws');
const { authMiddleware } = require('../middleware/auth');
const router  = express.Router();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'dish-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware : admin seulement
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  next();
}

// ══════════════════════════════════════════════════════════════
// GET /api/admin/stats — Statistiques globales
// ══════════════════════════════════════════════════════════════
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  const users   = db.get('users').value();
  const orders  = db.get('orders').value();
  const dishes  = db.get('dishes').value();

  const totalUsers    = users.length;
  const totalClients  = users.filter(u => u.role === 'client').length;
  const totalStaff    = users.filter(u => u.role === 'staff').length;
  const totalAdmins   = users.filter(u => u.role === 'admin').length;
  const totalOrders   = orders.length;
  const totalDishes   = dishes.length;
  const revenue       = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.price, 0);
  const activeOrders  = orders.filter(o => ['pending', 'preparing'].includes(o.status)).length;
  const deliveries    = orders.filter(o => o.type === 'delivery' && o.status !== 'done').length;
  const avgOrderPrice = totalOrders > 0 ? Math.round(orders.reduce((s, o) => s + o.price, 0) / totalOrders) : 0;

  res.json({
    users: { total: totalUsers, clients: totalClients, staff: totalStaff, admins: totalAdmins },
    orders: { total: totalOrders, active: activeOrders, deliveries, revenue, avgPrice: avgOrderPrice },
    dishes: { total: totalDishes, available: dishes.filter(d => d.available).length, platDuJour: dishes.find(d => d.platJour)?.name || null },
  });
});

// ══════════════════════════════════════════════════════════════
// GET /api/admin/charts — Données pour les graphiques
// ══════════════════════════════════════════════════════════════
router.get('/charts', authMiddleware, adminOnly, (req, res) => {
  const orders = db.get('orders').value();
  const users  = db.get('users').value();
  const dishes = db.get('dishes').value();

  // ── Ventes par jour (7 derniers jours) ──
  const dailySales = {};
  const dailyRevenue = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailySales[key] = 0;
    dailyRevenue[key] = 0;
  }
  orders.forEach(o => {
    const day = o.createdAt?.slice(0, 10);
    if (day && dailySales[day] !== undefined) {
      dailySales[day]++;
      if (o.status === 'done') dailyRevenue[day] += o.price;
    }
  });

  // ── Répartition des statuts ──
  const statusCounts = { pending: 0, preparing: 0, ready: 0, delivery: 0, done: 0 };
  orders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  // ── Ventes par catégorie de plat ──
  const categorySales = {};
  dishes.forEach(d => { categorySales[d.category || 'plat'] = 0; });
  orders.forEach(o => {
    o.items.forEach(itemName => {
      const dish = dishes.find(d => d.name === itemName);
      if (dish) categorySales[dish.category || 'plat'] = (categorySales[dish.category || 'plat'] || 0) + 1;
    });
  });

  // ── Clients inscrits par jour (7 derniers jours) ──
  const dailyClients = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyClients[key] = 0;
  }
  users.filter(u => u.role === 'client').forEach(u => {
    const day = u.createdAt?.slice(0, 10);
    if (day && dailyClients[day] !== undefined) dailyClients[day]++;
  });

  // ── Total clients cumulé par jour ──
  const cumulativeClients = {};
  let cumCount = users.filter(u => u.role === 'client' && u.createdAt < new Date(now.setDate(now.getDate() - 6)).toISOString()).length;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    cumCount += dailyClients[key] || 0;
    cumulativeClients[key] = cumCount;
  }

  // ── Top plats vendus ──
  const dishSales = {};
  orders.forEach(o => {
    o.items.forEach(itemName => {
      dishSales[itemName] = (dishSales[itemName] || 0) + 1;
    });
  });
  const topDishes = Object.entries(dishSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // ── Commandes par type ──
  const typeCounts = { dine: 0, delivery: 0 };
  orders.forEach(o => { typeCounts[o.type] = (typeCounts[o.type] || 0) + 1; });

  res.json({
    dailySales: { labels: Object.keys(dailySales).map(d => d.slice(5).split('-').reverse().join('/')), orders: Object.values(dailySales), revenue: Object.values(dailyRevenue) },
    statusCounts,
    categorySales: { labels: Object.keys(categorySales).map(c => ({ plat: 'Plats', entree: 'Entrées', dessert: 'Desserts', boisson: 'Boissons', accomp: 'Accomp.' }[c] || c)), values: Object.values(categorySales) },
    clientGrowth: { labels: Object.keys(dailyClients).map(d => d.slice(5).split('-').reverse().join('/')), newClients: Object.values(dailyClients), cumulative: Object.values(cumulativeClients) },
    topDishes: { labels: topDishes.map(d => d[0]), values: topDishes.map(d => d[1]) },
    typeCounts
  });
});

// ══════════════════════════════════════════════════════════════
// GET /api/admin/users — Liste tous les utilisateurs
// ══════════════════════════════════════════════════════════════
router.get('/users', authMiddleware, adminOnly, (req, res) => {
  const { role } = req.query;
  let users = db.get('users').value();
  if (role) users = users.filter(u => u.role === role);
  const safe = users.map(u => ({
    id: u.id, username: u.username, role: u.role, name: u.name,
    phone: u.phone || '', createdAt: u.createdAt
  }));
  res.json(safe);
});

// ══════════════════════════════════════════════════════════════
// POST /api/admin/users — Créer un utilisateur (staff/client)
// ══════════════════════════════════════════════════════════════
router.post('/users', authMiddleware, adminOnly, (req, res) => {
  const { username, password, name, phone, role } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Nom d\'utilisateur, mot de passe et nom requis' });
  if (password.length < 4) return res.status(400).json({ error: 'Mot de passe trop court (4 caractères minimum)' });
  if (!['client', 'staff'].includes(role)) return res.status(400).json({ error: 'Rôle invalide (client ou staff)' });
  if (db.get('users').find({ username }).value()) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' });

  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const user = {
    id: newId, username,
    password: bcrypt.hashSync(password, 10),
    role, name, phone: phone || '',
    createdAt: new Date().toISOString()
  };
  db.get('users').push(user).write();
  ws.broadcast('user:new', { id: user.id, username: user.username, role: user.role, name: user.name });
  res.status(201).json({ id: user.id, username: user.username, role: user.role, name: user.name, phone: user.phone });
});

// ══════════════════════════════════════════════════════════════
// PUT /api/admin/users/:id — Modifier un utilisateur
// ══════════════════════════════════════════════════════════════
router.put('/users/:id', authMiddleware, adminOnly, (req, res) => {
  const user = db.get('users').find({ id: +req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Impossible de modifier un admin' });

  const { name, phone, role, password } = req.body;
  const updates = {};
  if (name)     updates.name     = name;
  if (phone !== undefined) updates.phone = phone;
  if (role && ['client', 'staff'].includes(role)) updates.role = role;
  if (password && password.length >= 4) updates.password = bcrypt.hashSync(password, 10);

  db.get('users').find({ id: +req.params.id }).assign(updates).write();
  const updated = db.get('users').find({ id: +req.params.id }).value();
  ws.broadcast('user:updated', { id: updated.id, username: updated.username, role: updated.role, name: updated.name, phone: updated.phone || '' });
  res.json({ id: updated.id, username: updated.username, role: updated.role, name: updated.name, phone: updated.phone || '' });
});

// ══════════════════════════════════════════════════════════════
// DELETE /api/admin/users/:id — Supprimer un utilisateur
// ══════════════════════════════════════════════════════════════
router.delete('/users/:id', authMiddleware, adminOnly, (req, res) => {
  const user = db.get('users').find({ id: +req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Impossible de supprimer un admin' });

  db.get('users').remove({ id: +req.params.id }).write();
  ws.broadcast('user:deleted', { id: +req.params.id });
  res.json({ message: 'Utilisateur supprimé' });
});

// ══════════════════════════════════════════════════════════════
// PATCH /api/admin/orders/:id/force — Forcer le statut d'une commande
// ══════════════════════════════════════════════════════════════
router.patch('/orders/:id/force', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'preparing', 'ready', 'delivery', 'done'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

  const order = db.get('orders').find({ id: +req.params.id }).value();
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  db.get('orders').find({ id: order.id }).assign({ status, updatedAt: new Date().toISOString() }).write();
  const updated = db.get('orders').find({ id: order.id }).value();
  ws.broadcast('order:updated', updated);
  res.json(updated);
});

// ══════════════════════════════════════════════════════════════
// DELETE /api/admin/orders/:id — Supprimer toute commande
// ══════════════════════════════════════════════════════════════
router.delete('/orders/:id', authMiddleware, adminOnly, (req, res) => {
  const order = db.get('orders').find({ id: +req.params.id }).value();
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  db.get('orders').remove({ id: +req.params.id }).write();
  ws.broadcast('order:deleted', { id: +req.params.id });
  res.json({ message: 'Commande supprimée' });
});

// ══════════════════════════════════════════════════════════════
// PUT /api/admin/dishes/:id — Modifier un plat (admin)
// ══════════════════════════════════════════════════════════════
router.put('/dishes/:id', authMiddleware, adminOnly, upload.single('imageFile'), (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });

  const { emoji, image, name, desc, price, available, category, platJour } = req.body;
  const updates = {};
  if (emoji !== undefined)     updates.emoji     = emoji;
  if (name !== undefined)      updates.name      = name;
  if (desc !== undefined)      updates.desc      = desc;
  if (price !== undefined)     updates.price     = parseInt(price);
  if (available !== undefined) updates.available = available === 'true' || available === true;
  if (category !== undefined)  updates.category  = category;
  if (platJour !== undefined) {
    if (platJour === 'true' || platJour === true) {
      db.get('dishes').each(d => { d.platJour = false; }).write();
      updates.platJour = true;
    }
  }

  if (req.file) {
    updates.image = '/api/uploads/' + req.file.filename;
  } else if (image !== undefined) {
    updates.image = image;
  }

  db.get('dishes').find({ id: +req.params.id }).assign(updates).write();
  const updated = db.get('dishes').find({ id: +req.params.id }).value();
  ws.broadcast('dish:updated', updated);
  if (platJour === 'true') ws.broadcast('dish:platdujour', updated);
  res.json(updated);
});

// ══════════════════════════════════════════════════════════════
// POST /api/admin/dishes — Ajouter un plat (admin)
// ══════════════════════════════════════════════════════════════
router.post('/dishes', authMiddleware, adminOnly, upload.single('imageFile'), (req, res) => {
  const { emoji, image, name, desc, price, category } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nom et prix requis' });

  let imageUrl = image || '';
  if (req.file) imageUrl = '/api/uploads/' + req.file.filename;

  const allDishes = db.get('dishes').value();
  const newId = allDishes.length > 0 ? Math.max(...allDishes.map(d => d.id)) + 1 : 1;
  const dish = {
    id: newId, emoji: emoji || '🍴', image: imageUrl, name, desc: desc || '',
    price: parseInt(price), available: true, platJour: false,
    category: category || 'plat', createdAt: new Date().toISOString()
  };
  db.get('dishes').push(dish).write();
  ws.broadcast('dish:new', dish);
  res.status(201).json(dish);
});

// ══════════════════════════════════════════════════════════════
// DELETE /api/admin/dishes/:id — Supprimer un plat (admin)
// ══════════════════════════════════════════════════════════════
router.delete('/dishes/:id', authMiddleware, adminOnly, (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });

  db.get('dishes').remove({ id: +req.params.id }).write();
  ws.broadcast('dish:deleted', { id: +req.params.id });
  res.json({ message: 'Plat supprimé' });
});

// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// GET /api/admin/payments — Historique des paiements
// ══════════════════════════════════════════════════════════════
router.get('/payments', authMiddleware, (req, res) => {
  const payments = db.get('payments').value().sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  res.json(payments);
});

// GET/PUT /api/admin/phone — Numéro Mvola
// ══════════════════════════════════════════════════════════════
router.get('/phone', authMiddleware, (req, res) => {
  const meta = db.get('meta').value();
  res.json({ phone: meta.phone || '0388451402' });
});

router.put('/phone', authMiddleware, adminOnly, (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Numéro requis' });
  db.get('meta').assign({ phone }).write();
  res.json({ success: true, phone });
});

module.exports = router;
