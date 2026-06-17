// backend/ws.js — Gestionnaire WebSocket temps réel
let wss = null;

function init(server) {
  const { WebSocketServer } = require('ws');
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    console.log(`[WS] Client connecté (${wss.clients.size} total)`);
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => console.log(`[WS] Client déconnecté (${wss.clients.size} restants)`));
    ws.on('error', (err) => console.error('[WS] Erreur:', err.message));
    // Envoyer confirmation de connexion
    ws.send(JSON.stringify({ type: 'connected', message: 'T-isakafo WebSocket actif' }));
  });

  // Ping/pong pour garder les connexions vivantes
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));
  console.log('[WS] Serveur WebSocket initialisé');
}

// Diffuser un événement à tous les clients connectés
function broadcast(event, data) {
  if (!wss) return;
  const msg = JSON.stringify({ type: event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try { client.send(msg); } catch(e) {}
    }
  });
}

module.exports = { init, broadcast };
