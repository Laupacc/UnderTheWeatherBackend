var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

const OWM_API_KEY = process.env.OWM_API_KEY;


// Get all cities from database
router.get('/', (req, res) => {
	City.find().then(data => {
		res.json({ weather: data });
	});
});


// Add city current weather
router.post('/current', (req, res) => {
	// Check if the city has not already been added
	City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
		// If city does not exist in database
		if (dbData === null) {
			// Request OpenWeatherMap API for weather data
			fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${OWM_API_KEY}&units=metric`)
				.then(response => response.json())
				.then(apiData => {
					// Creates new document with weather data
					const newCity = new City({
						cityName: req.body.cityName,
						main: apiData.weather[0].main,
						description: apiData.weather[0].description,
						icon: apiData.weather[0].icon,
						temp: apiData.main.temp,
						feels_like: apiData.main.feels_like,
						tempMin: apiData.main.temp_min,
						tempMax: apiData.main.temp_max,
						humidity: apiData.main.humidity,
						wind: apiData.wind.speed,
						clouds: apiData.clouds.all,
						rain: apiData.rain ? apiData.rain['1h'] : 0,
						snow: apiData.snow ? apiData.snow['1h'] : 0,
						sunrise: apiData.sys.sunrise,
						sunset: apiData.sys.sunset,
					});

					// Finally save in database
					newCity.save().then(newDoc => {
						res.json({ result: true, weather: newDoc });
					});
				});
		} else {
			// City already exists in database
			res.json({ result: false, error: 'City already saved' });
		}
	});
});

// Add city from user location
router.post('/current/location', (req, res) => {
	City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
		if (dbData === null) {
			fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lon}&appid=${OWM_API_KEY}&units=metric`)
				.then(response => response.json())
				.then(apiData => {
					const newCity = new City({
						cityName: apiData.name,
						main: apiData.weather[0].main,
						description: apiData.weather[0].description,
						icon: apiData.weather[0].icon,
						temp: apiData.main.temp,
						feels_like: apiData.main.feels_like,
						tempMin: apiData.main.temp_min,
						tempMax: apiData.main.temp_max,
						humidity: apiData.main.humidity,
						wind: apiData.wind.speed,
						clouds: apiData.clouds.all,
						rain: apiData.rain ? apiData.rain['1h'] : 0,
						snow: apiData.snow ? apiData.snow['1h'] : 0,
						sunrise: apiData.sys.sunrise,
						sunset: apiData.sys.sunset,
					});
					newCity.save().then(newDoc => {
						res.json({ result: true, weather: newDoc });
					});
				});
		} else {
			res.json({ result: false, error: 'City already saved' });
		}
	});
});



// Add city forecast
router.post('/forecast', (req, res) => {
	// Check if the city has not already been added
	City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
		if (dbData === null) {
			// Request OpenWeatherMap API for forecast data
			fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${req.body.cityName}&appid=${OWM_API_KEY}&units=metric`)
				.then(response => response.json())
				.then(apiData => {
					// Creates new document with forecast data
					const newCity = new City({
						cityName: req.body.cityName,
						forecast: apiData.list,
					});

					// Finally save in database
					newCity.save().then(newDoc => {
						res.json({ result: true, weather: newDoc });
					});
				});
		} else {
			// City already exists in database
			res.json({ result: false, error: 'City already saved' });
		}
	});
});


// Get city by name
router.get("/:cityName", (req, res) => {
	City.findOne({
		cityName: { $regex: new RegExp(req.params.cityName, "i") },
	}).then(data => {
		if (data) {
			res.json({ result: true, weather: data });
		} else {
			res.json({ result: false, error: "City not found" });
		}
	});
});

// Delete city by name
router.delete("/:cityName", (req, res) => {
	City.deleteOne({
		cityName: { $regex: new RegExp(req.params.cityName, "i") },
	}).then(deletedDoc => {
		if (deletedDoc.deletedCount > 0) {
			// document successfully deleted
			City.find().then(data => {
				res.json({ result: true, weather: data });
			});
		} else {
			res.json({ result: false, error: "City not found" });
		}
	});
});

module.exports = router;
