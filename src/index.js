const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 8080;
const server = http.createServer();
const io = require('socket.io')(server, {
    cors: {origin: '*'}
});

const rooms= {};

io.on('connection', (socket) => {
    console.log('\nse conecto un cliente')
    socket.on('join_room',(data) =>{
        const { room , user} = data;
        socket.join(room);
        if(!rooms[room]){
            rooms[room] = [];
        }
        rooms[room].push(user);
        console.log(`${user} en sala ${room}`)
        console.log(rooms);
        const message = {
            usuario: 'INFO',    
            mensaje: `${user} se ha unido a la sala`
        };
        io.to(room).emit('chat_message', message)
    });
    
    socket.on('chat_message', (data) => {  
        const { room, message } = data;
        const { usuario, mensaje } = message
        io.to(room).emit('chat_message', message)
        console.log(data) 
    });
})

server.listen(port, () => {
    console.log(`Server listening on por ${port}`);
});