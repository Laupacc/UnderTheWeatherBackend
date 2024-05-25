const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    token: String,
    cities: [{ type: Schema.Types.ObjectId, ref: 'cities' }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;