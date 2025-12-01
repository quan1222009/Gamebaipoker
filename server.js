const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');
const sam = require('./logic/sam');
const tienlen = require('./logic/tienlen');
const uno = require('./logic/uno');
const cheat = require('./logic/cheat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

// --- Connect MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB error:", err));

// --- API đăng nhập / đăng ký ---
app.post('/login', async (req,res)=>{
    const {username} = req.body;
    if(!username) return res.status(400).json({error:'Chưa nhập username'});
    const id = username.toLowerCase();
    let user = await User.findOne({id});
    if(!user){
        user = await User.create({username, id, friends:[], stats:{gamesPlayed:0,gamesWon:0}});
    }
    res.json({id: user.id, username: user.username, friends: user.friends});
});

app.get('/friends/:id', async (req,res)=>{
    const user = await User.findOne({id: req.params.id});
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
    res.json({success:true, friends: user.friends});
});

// --- Socket.io rooms ---
let rooms = {};
io.on('connection', socket=>{
    console.log('Client connected:', socket.id);

    socket.on('createRoom', ({room, username, gameType})=>{
        socket.join(room);
        if(!rooms[room]){
            rooms[room] = {players:[], table:[], turn:0, gameType, logic:null};
            if(gameType==='sam') rooms[room].logic = sam;
            else if(gameType==='tienlen') rooms[room].logic = tienlen;
            else if(gameType==='uno') rooms[room].logic = uno;
            else if(gameType==='cheat') rooms[room].logic = cheat;
        }
        rooms[room].players.push({id:socket.id, username, hand:[]});
        io.to(room).emit('message', `${username} đã vào phòng`);
    });

    socket.on('sendMove', ({room, move})=>{
        const gameLogic = rooms[room]?.logic;
        if(!gameLogic) return;
        const valid = gameLogic.validMove([], rooms[room].table, move);
        if(valid){
            rooms[room].table.push(move);
            io.to(room).emit('opponentMove', move);
        } else {
            socket.emit('invalidMove');
        }
    });

    socket.on('disconnect', ()=>{
        console.log('Client disconnected:', socket.id);
        for(let r in rooms){
            rooms[r].players = rooms[r].players.filter(p=>p.id!==socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
