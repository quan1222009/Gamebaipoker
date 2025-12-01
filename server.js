const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.log(err));

// Models
const User = require('./models/User');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

// API đăng nhập/đăng ký
app.post('/register', async (req,res)=>{
    const {username,password} = req.body;
    let exists = await User.findOne({username});
    if(exists) return res.status(400).json({message:'User exists'});
    let newUser = new User({username,password});
    await newUser.save();
    res.json({message:'Registered', userId:newUser._id});
});

app.post('/login', async (req,res)=>{
    const {username,password} = req.body;
    let user = await User.findOne({username,password});
    if(!user) return res.status(400).json({message:'Invalid'});
    res.json({message:'Logged in', userId:user._id});
});

// Socket.io logic online
let rooms = {};
io.on('connection', socket=>{
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({room, gameType})=>{
        socket.join(room);
        if(!rooms[room]) rooms[room] = {players:[], gameType};
        rooms[room].players.push(socket.id);
        io.to(room).emit('roomUpdate', rooms[room].players);
    });

    socket.on('sendMove', ({room, move})=>{
        socket.to(room).emit('opponentMove', move);
    });

    socket.on('disconnect', ()=>{
        console.log('User disconnected:', socket.id);
        for(let r in rooms){
            rooms[r].players = rooms[r].players.filter(id=>id!==socket.id);
            io.to(r).emit('roomUpdate', rooms[r].players);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
