// backend/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../../database/db');
const ws      = require('../ws');
const { authMiddleware } = require('../middleware/auth');
const router  = express.Router();

const sign = (user) => jwt.sign(
  { id:user.id, username:user.username, role:user.role, name:user.name },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' }
);

// POST /api/auth/login  (admin + client)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Identifiants requis' });
  const user = db.get('users').find({ username }).value();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
  const token = sign(user);
  res.json({ token, user: { id:user.id, username:user.username, role:user.role, name:user.name, phone:user.phone||'' } });
});

// POST /api/auth/register  (inscription client)
router.post('/register', (req, res) => {
  const { username, password, name, phone } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Nom d\'utilisateur, mot de passe et nom complet requis' });
  if (password.length < 4) return res.status(400).json({ error: 'Mot de passe trop court (4 caractères minimum)' });
  if (db.get('users').find({ username }).value()) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u=>u.id)) + 1 : 1;
  const user  = { id:newId, username, password:bcrypt.hashSync(password,10), role:'client', name, phone:phone||'', createdAt:new Date().toISOString() };
  db.get('users').push(user).write();
  ws.broadcast('user:new', { id: user.id, username: user.username, role: user.role, name: user.name });
  const token = sign(user);
  res.status(201).json({ token, user: { id:user.id, username, role:'client', name, phone:user.phone } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.get('users').find({ id:req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ id:user.id, username:user.username, role:user.role, name:user.name, phone:user.phone||'' });
});

// PUT /api/auth/profile  (modifier son profil)
router.put('/profile', authMiddleware, (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name)  updates.name  = name;
  if (phone !== undefined) updates.phone = phone;
  db.get('users').find({ id:req.user.id }).assign(updates).write();
  const user = db.get('users').find({ id:req.user.id }).value();
  ws.broadcast('user:updated', { id: user.id, username: user.username, role: user.role, name: user.name, phone: user.phone || '' });
  res.json({ id:user.id, username:user.username, role:user.role, name:user.name, phone:user.phone||'' });
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Les deux mots de passe sont requis' });
  if (newPassword.length < 4) return res.status(400).json({ error: 'Nouveau mot de passe trop court' });
  const user = db.get('users').find({ id:req.user.id }).value();
  if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
  db.get('users').find({ id:req.user.id }).assign({ password:bcrypt.hashSync(newPassword,10) }).write();
  res.json({ message: 'Mot de passe modifié avec succès' });
});

// GET /api/auth/clients  (admin et staff — liste des clients)
router.get('/clients', authMiddleware, (req, res) => {
  if (!['admin','staff'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
  const clients = db.get('users').filter({ role:'client' }).map(u => ({ id:u.id, username:u.username, name:u.name, phone:u.phone||'', createdAt:u.createdAt })).value();
  res.json(clients);
});

module.exports = router;
