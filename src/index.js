const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 8080;
const server = http.createServer();
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join_room', (data) => {
    const { room, user } = data;
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {};
    }

    const numUsers = Object.keys(rooms[room]).length;
    if (numUsers === 2 || rooms[room][user]) {
      return;
    }

    rooms[room][user] = { connected: true };

    // Enviar el estado del otro usuario si está presente
    const otherUser = Object.keys(rooms[room]).find((username) => username !== user);
    if (otherUser) {
      const otherUserState = rooms[room][otherUser].connected;
      socket.emit('user_connected', { user: otherUser, connected: otherUserState });
    }

    socket.broadcast.to(room).emit('user_connected', { user, connected: true });
  });
  
    
    socket.on('chat_message', (data) => {  
        const { room, message } = data;
        const { usuario, mensaje } = message
        io.to(room).emit('chat_message', message)
    });

  socket.on('exit_room', (data) => {
    const { user, room } = data;

    if (rooms[room] && rooms[room][user]) {
      delete rooms[room][user];

      socket.broadcast.to(room).emit('user_disconnected', { user, connected: false });

      socket.leave(room);

      if (Object.keys(rooms[room]).length === 0) {
        delete rooms[room];
      }
    }
  });

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((room) => {
      if (rooms[room][socket.id]) {
        const user = Object.keys(rooms[room]).find((username) => username === socket.id);
        delete rooms[room][user];
        socket.broadcast.to(room).emit('user_disconnected', { user, connected: false });

        if (Object.keys(rooms[room]).length === 0) {
          delete rooms[room];
        }
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});