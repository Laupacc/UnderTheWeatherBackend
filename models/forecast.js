const mongoose = require('mongoose');

const forecastSchema = mongoose.Schema({
    cityName: String,
    date: Number,
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
});

const Forecast = mongoose.model('forecast', forecastSchema);

module.exports = Forecast;

