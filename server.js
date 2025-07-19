const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

const clients = new Map();

server.on('connection', (ws) => {
  const id = Math.random().toString(36).substring(2);
  clients.set(id, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'join') {
        clients.forEach((client, clientId) => {
          if (clientId !== id && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'new-peer', id }));
          }
        });
      } else if (data.to && clients.has(data.to)) {
        const target = clients.get(data.to);
        if (target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify({ ...data, from: id }));
        }
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  ws.on('close', () => {
    clients.delete(id);
  });

  ws.send(JSON.stringify({ type: 'welcome', id }));
});

console.log('WebRTC signaling server running on port', process.env.PORT || 8080);
