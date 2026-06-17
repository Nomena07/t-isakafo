// backend/routes/delivery.js
const express = require('express');
const router  = express.Router();
const db      = require('../../database/db');
const ws      = require('../ws');
const { authMiddleware } = require('../middleware/auth');

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé' });
  next();
}

// GET /api/delivery/settings
router.get('/settings', (req, res) => {
  const meta = db.get('meta').value();
  res.json({ success: true, data: meta.delivery || {} });
});

// PUT /api/delivery/settings
router.put('/settings', authMiddleware, adminOnly, (req, res) => {
  const { restaurantLat, restaurantLng, feePerKm, minFee } = req.body;
  const d = db.get('meta').get('delivery');
  if (restaurantLat !== undefined) d.set('restaurantLat', +restaurantLat).write();
  if (restaurantLng !== undefined) d.set('restaurantLng', +restaurantLng).write();
  if (feePerKm !== undefined) d.set('feePerKm', +feePerKm).write();
  if (minFee !== undefined) d.set('minFee', +minFee).write();
  const updated = db.get('meta').get('delivery').value();
  ws.broadcast('delivery:updated', updated);
  res.json({ success: true, data: updated, message: 'Paramètres de livraison mis à jour' });
});

module.exports = router;
