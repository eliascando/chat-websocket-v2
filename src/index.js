const http = require('http');
const { Socket } = require('socket.io');

const port = process.env.PORT || 8080
const server = http.createServer();

const io = require('socket.io')(server, {
    cors: {origin: '*'}
});

io.on('connection', (socket) => {
    socket.on('chat_message', (data) => {   
        io.emit('chat_message', data);
    })
})

server.listen(port);