const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

// --- Connect MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
.then(()=>console.log("MongoDB connected!"))
.catch(err=>console.log("MongoDB connection error:", err));

// --- REST API ---
app.post('/login', async (req,res)=>{
    const {username} = req.body;
    if(!username) return res.status(400).json({error:'Chưa nhập username'});
    const id = username.toLowerCase();
    let user = await User.findOne({id});
    if(!user){
        user = await User.create({username, id, friends:[]});
    }
    res.json(user);
});

app.get('/friends/:id', async (req,res)=>{
    const {id} = req.params;
    const user = await User.findOne({id});
    if(!user) return res.status(404).json({error:'User không tồn tại'});
    res.json(user.friends);
});

app.post('/addFriend', async (req,res)=>{
    const {id, friendID} = req.body;
    const user = await User.findOne({id});
    const friend = await User.findOne({id:friendID});
    if(!user || !friend) return res.status(404).json({error:'User không tồn tại'});
    if(!user.friends.includes(friendID)){
        user.friends.push(friendID);
        await user.save();
    }
    res.json({success:true});
});

// --- Socket.io rooms ---
let rooms = {};
io.on('connection', socket=>{
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', ({room, username})=>{
        socket.join(room);
        if(!rooms[room]) rooms[room] = {players:[], table:[], turn:0};
        rooms[room].players.push({id:socket.id, username, hand:[]});
        io.to(room).emit('message', `${username} đã vào phòng`);
    });

    socket.on('sendMove', ({room, move})=>{
        io.to(room).emit('opponentMove', move);
    });

    socket.on('disconnect', ()=>{
        console.log('Client disconnected:', socket.id);
    });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
