// backend/routes/dishes.js
const express = require('express');
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

// ── GET /api/dishes ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  let dishes = db.get('dishes').value();
  if (req.query.available === 'true') dishes = dishes.filter(d => d.available);
  if (req.query.category) dishes = dishes.filter(d => d.category === req.query.category);
  if (req.query.tags) {
    const filterTags = req.query.tags.split(',').map(t => t.trim().toLowerCase());
    dishes = dishes.filter(d => {
      const dishTags = (d.tags || '').split(',').map(t => t.trim().toLowerCase());
      return filterTags.some(ft => dishTags.includes(ft));
    });
  }
  res.json(dishes);
});

// ── GET /api/dishes/plat-du-jour ──────────────────────────────────────────
router.get('/plat-du-jour', (req, res) => {
  const dish = db.get('dishes').find({ platJour: true }).value();
  res.json(dish || null);
});

// ── GET /api/dishes/:id ───────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });
  res.json(dish);
});

// ── POST /api/dishes  (ajouter un plat) ───────────────────────────────────
router.post('/', authMiddleware, upload.single('imageFile'), (req, res) => {
  const { emoji, image, name, desc, price, category, tags } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nom et prix requis' });

  let imageUrl = image || '';
  if (req.file) imageUrl = '/api/uploads/' + req.file.filename;

  const allDishes = db.get('dishes').value();
  const newId = allDishes.length > 0 ? Math.max(...allDishes.map(d => d.id)) + 1 : 1;

  const dish = {
    id: newId,
    emoji: emoji || '🍴',
    image: imageUrl,
    name,
    desc: desc || '',
    price: parseInt(price),
    available: true,
    platJour: false,
    category: category || 'plat',
    tags: tags || '',
    createdAt: new Date().toISOString(),
  };

  db.get('dishes').push(dish).write();
  ws.broadcast('dish:new', dish);
  res.status(201).json(dish);
});

// ── PUT /api/dishes/:id  (modifier un plat) ───────────────────────────────
router.put('/:id', authMiddleware, upload.single('imageFile'), (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });

  const { emoji, image, name, desc, price, available, category, platJour, tags } = req.body;
  const updates = {};
  if (emoji     !== undefined) updates.emoji     = emoji;
  if (name      !== undefined) updates.name      = name;
  if (desc      !== undefined) updates.desc      = desc;
  if (price     !== undefined) updates.price     = parseInt(price);
  if (available !== undefined) updates.available = available === 'true' || available === true;
  if (category  !== undefined) updates.category  = category;
  if (tags      !== undefined) updates.tags      = tags;
  if (platJour !== undefined && platJour === 'true') {
    db.get('dishes').each(d => { d.platJour = false; }).write();
    updates.platJour = true;
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

// ── PATCH /api/dishes/:id/plat-du-jour ───────────────────────────────────
router.patch('/:id/plat-du-jour', authMiddleware, (req, res) => {
  db.get('dishes').each(d => { d.platJour = false; }).write();
  db.get('dishes').find({ id: +req.params.id }).assign({ platJour: true }).write();
  const updated = db.get('dishes').find({ id: +req.params.id }).value();
  if (!updated) return res.status(404).json({ error: 'Plat introuvable' });
  ws.broadcast('dish:platdujour', updated);
  res.json(updated);
});

// ── PATCH /api/dishes/:id/toggle  (activer/désactiver) ────────────────────
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });
  db.get('dishes').find({ id: +req.params.id }).assign({ available: !dish.available }).write();
  const updated = db.get('dishes').find({ id: +req.params.id }).value();
  ws.broadcast('dish:updated', updated);
  res.json(updated);
});

// ── DELETE /api/dishes/:id ────────────────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  const dish = db.get('dishes').find({ id: +req.params.id }).value();
  if (!dish) return res.status(404).json({ error: 'Plat introuvable' });
  if (dish.platJour) return res.status(400).json({ error: 'Impossible de supprimer le plat du jour actif' });
  db.get('dishes').remove({ id: +req.params.id }).write();
  ws.broadcast('dish:deleted', { id: +req.params.id });
  res.json({ message: 'Plat supprimé' });
});

module.exports = router;
