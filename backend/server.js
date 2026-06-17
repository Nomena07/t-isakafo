// backend/server.js — Serveur principal T-isakafo
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const http    = require('http');
const path    = require('path');
const ws      = require('./ws');

const app    = express();
const server = http.createServer(app);

// ── Initialiser WebSocket ────────────────────────────────────────────────
ws.init(server);

// ── Middlewares ──────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Servir le frontend ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend'), { maxAge: 0, etag: false, lastModified: false }));
app.use((req, res, next) => { res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); res.set('Pragma', 'no-cache'); res.set('Expires', '0'); next(); });

// ── Servir les images uploadées ──────────────────────────────────────────
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes API ───────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/dishes',  require('./routes/dishes'));
app.use('/api/upload',  require('./routes/upload'));
app.use('/api/tables',  require('./routes/tables'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/landing', require('./routes/landing'));
app.use('/api/admin',   require('./routes/admin'));


// ── Route de santé ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});

// ── Toutes les autres routes → frontend SPA ──────────────────────────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Démarrer le serveur ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const os = require('os');

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address);
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('');
  console.log('  ██████╗ ███████╗███████╗████████╗ █████╗ ██╗   ██╗');
  console.log('  ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║   ██║');
  console.log('  ██████╔╝█████╗  ███████╗   ██║   ███████║██║   ██║');
  console.log('  ██╔══██╗██╔══╝  ╚════██║   ██║   ██╔══██║██║   ██║');
  console.log('  ██║  ██║███████╗███████║   ██║   ██║  ██║╚██████╔╝');
  console.log('  ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ');
  console.log('');
  console.log(`  🍽️  T-isakafo v1.0 démarré`);
  console.log(`  🌐  Local    → http://localhost:${PORT}`);
  if (ips.length > 0) {
    console.log(`  📱  Réseau   → http://${ips[0]}:${PORT}`);
    ips.slice(1).forEach(ip => console.log(`  📱  Réseau   → http://${ip}:${PORT}`));
  }
  console.log(`  📡  WebSocket ws://localhost:${PORT}`);
  console.log(`  📂  Base de données : database/data/restaurant.json`);
  console.log('');
  console.log('  Connexion admin → username: admin / password: admin123');
  console.log('');
});
