// backend/routes/upload.js — Endpoint d'upload d'images
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
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

// POST /api/upload — Upload une image
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé' });
  const url = '/api/uploads/' + req.file.filename;
  res.json({ url });
});

module.exports = router;
