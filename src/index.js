const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 8080;
const server = http.createServer();
const io = require('socket.io')(server, {
    cors: {origin: '*'}
});

const rooms= {};

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        const { room, user } = data;
        socket.join(room);
      
        if (!rooms[room]) {
          rooms[room] = [];
        }
      
        if (!rooms[room].includes(user)) {
            rooms[room].push(user);
            const message = {
              usuario: 'INFO',
              mensaje: `${user} se ha unido a la sala`
            };
            io.to(room).emit('chat_message', message);
        }
    });
    
    socket.on('chat_message', (data) => {  
        const { room, message } = data;
        const { usuario, mensaje } = message
        io.to(room).emit('chat_message', message)
    });

    socket.on('exit_room', (data) => {
        const { user, room } = data;
      
        // Verificar si el usuario está en la sala
        if (rooms[room] && rooms[room].includes(user)) {
          // Remover al usuario de la lista de usuarios de la sala
          rooms[room] = rooms[room].filter(username => username !== user);
      
          // Emitir un mensaje informando la desconexión del usuario
          const message = {
            usuario: 'INFO',
            mensaje: `${user} se ha desconectado de la sala ${room}`
          };
          io.to(room).emit('chat_message', message);
      
          socket.leave(room);
          
          if (rooms[room].length === 0) {
              // Eliminar la sala
              delete rooms[room];
            }
        }
      });
      
      
})

server.listen(port, () => {
    console.log(`Server listening on por ${port}`);
});