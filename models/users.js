const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    cities: [{
        cityName: String,
        country: String,
        main: String,
        description: String,
        icon: String,
        temp: Number,
        feels_like: Number,
        tempMin: Number,
        tempMax: Number,
        humidity: Number,
        wind: Number,
        clouds: Number,
        rain: Number,
        snow: Number,
        sunrise: Number,
        sunset: Number,
        latitude: Number,
        longitude: Number,
        timezone: Number,
    }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;
