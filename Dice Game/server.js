// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const lobbies = {};

function findOrCreateLobby(socket) {
  // Find a lobby with 1 player or create a new one
  for (const [lobbyId, lobby] of Object.entries(lobbies)) {
    if (lobby.players.length === 1) {
      lobby.players.push(socket.id);
      return lobbyId;
    }
  }
  // Create new lobby
  const lobbyId = Math.random().toString(36).slice(2, 10);
  lobbies[lobbyId] = { players: [socket.id], rolls: {} };
  return lobbyId;
}

io.on('connection', (socket) => {
  let lobbyId = findOrCreateLobby(socket);
  socket.join(lobbyId);
  socket.lobbyId = lobbyId;

  // Notify players of lobby state
  io.to(lobbyId).emit('lobby_update', {
    players: lobbies[lobbyId].players,
    you: socket.id
  });

  socket.on('roll', (roll) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;
    lobby.rolls[socket.id] = roll;
    io.to(lobbyId).emit('roll_update', {
      player: socket.id,
      roll
    });
    // If both rolled, send result
    if (Object.keys(lobby.rolls).length === 2) {
      const [p1, p2] = lobby.players;
      const r1 = lobby.rolls[p1];
      const r2 = lobby.rolls[p2];
      let winner = null;
      if (r1 > r2) winner = p1;
      else if (r2 > r1) winner = p2;
      io.to(lobbyId).emit('result', { rolls: { [p1]: r1, [p2]: r2 }, winner });
      // Reset for next round
      lobby.rolls = {};
    }
  });

  socket.on('disconnect', () => {
    const lobby = lobbies[lobbyId];
    if (lobby) {
      lobby.players = lobby.players.filter(id => id !== socket.id);
      if (lobby.players.length === 0) delete lobbies[lobbyId];
      else io.to(lobbyId).emit('lobby_update', { players: lobby.players });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 