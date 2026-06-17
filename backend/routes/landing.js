// backend/routes/landing.js — Routes API pour la page de présentation
const express = require('express');
const router  = express.Router();
const db      = require('../../database/db');
const ws      = require('../ws');
const { authMiddleware } = require('../middleware/auth');

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  next();
}

// ── GET /api/landing — Contenu de la landing page (public) ────────────────
router.get('/', (req, res) => {
  const landing = db.get('landing').value();
  res.json({ success: true, data: landing });
});

// ── PUT /api/landing — Modifier la landing page (admin only) ──────────────
router.put('/', authMiddleware, adminOnly, (req, res) => {
  const { hero, story, cta, footer, auth } = req.body;
  const landing = db.get('landing');

  if (hero) {
    if (hero.image !== undefined)   landing.set('hero.image', hero.image).write();
    if (hero.tag !== undefined)     landing.set('hero.tag', hero.tag).write();
    if (hero.title !== undefined)   landing.set('hero.title', hero.title).write();
    if (hero.subtitle !== undefined) landing.set('hero.subtitle', hero.subtitle).write();
  }

  if (story) {
    if (story.image !== undefined)  landing.set('story.image', story.image).write();
    if (story.tag !== undefined)    landing.set('story.tag', story.tag).write();
    if (story.title !== undefined)  landing.set('story.title', story.title).write();
    if (story.desc1 !== undefined)  landing.set('story.desc1', story.desc1).write();
    if (story.desc2 !== undefined)  landing.set('story.desc2', story.desc2).write();
    if (story.quote !== undefined)  landing.set('story.quote', story.quote).write();
  }

  if (cta) {
    if (cta.title !== undefined)  landing.set('cta.title', cta.title).write();
    if (cta.desc !== undefined)   landing.set('cta.desc', cta.desc).write();
  }

  if (footer) {
    if (footer.text !== undefined)   landing.set('footer.text', footer.text).write();
    if (footer.links !== undefined)  landing.set('footer.links', footer.links).write();
  }

  if (auth) {
    if (auth.image !== undefined)  landing.set('auth.image', auth.image).write();
    if (auth.quote !== undefined)  landing.set('auth.quote', auth.quote).write();
    if (auth.attrib !== undefined) landing.set('auth.attrib', auth.attrib).write();
  }

  const updated = db.get('landing').value();
  ws.broadcast('landing:updated', updated);
  res.json({ success: true, data: updated, message: 'Landing page mise à jour' });
});

module.exports = router;
