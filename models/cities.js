const mongoose = require('mongoose');

const citySchema = mongoose.Schema({
	cityName: { type: String, required: true, unique: true },
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
	lattitude: Number,
	longitude: Number,
	lastUpdated: { type: Date, default: Date.now }
});

const City = mongoose.model('cities', citySchema);

module.exports = City;

