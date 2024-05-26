const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cities' }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;
