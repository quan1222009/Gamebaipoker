const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    friends: [String],
    stats: {
        gamesPlayed: { type: Number, default:0 },
        gamesWon: { type: Number, default:0 }
    }
}, {timestamps:true});

module.exports = mongoose.model('User', userSchema);
