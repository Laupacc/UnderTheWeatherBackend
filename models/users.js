const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    token: String,
    // cities: [{ type: Schema.Types.ObjectId, ref: 'City' }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;