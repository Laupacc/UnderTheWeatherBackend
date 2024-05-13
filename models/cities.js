const mongoose = require('mongoose');

const citySchema = mongoose.Schema({
	cityName: String,
	main: String,
	description: String,
	feels_like: Number,
	tempMin: Number,
	tempMax: Number,
	humidity: Number,
	wind: Number,
	clouds: Number,
	rain: Number,
	snow: Number
});

const City = mongoose.model('cities', citySchema);

module.exports = City;

