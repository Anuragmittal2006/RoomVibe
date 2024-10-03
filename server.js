const express = require('express'); 
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public')); // Serve static files from 'public' folder

// Serve index.html from the main directory
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Serve index.html from the main directory
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join a specific room
    socket.on('join-room', (roomId) => {
        console.log(`${socket.id} joined room: ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id); // Notify others in the room

        // Handle offer from the client
        socket.on('offer', (data) => {
            socket.to(roomId).emit('offer', { offer: data.offer, sender: socket.id });
        });

        // Handle answer
        socket.on('answer', (data) => {
            socket.to(roomId).emit('answer', { answer: data.answer, sender: socket.id });
        });

        // Handle ICE candidates
        socket.on('ice-candidate', (data) => {
            socket.to(roomId).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
