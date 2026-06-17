// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token invalide' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token expiré ou invalide' });
  }
}

// Middleware optionnel (ne bloque pas si pas de token — pour les routes publiques)
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header) {
    const token = header.split(' ')[1];
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret'); } catch(e) {}
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
