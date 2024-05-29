var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');
const User = require('../models/users');

const OWM_API_KEY = process.env.OWM_API_KEY;


// Update weather data for a specific city
// const updateCityWeather = async (cityName) => {
// 	const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}&units=metric`);
// 	const apiData = await response.json();
// 	if (apiData.cod === 200) {
// 		// Update city document with new data
// 		await City.findOneAndUpdate(
// 			{ cityName: cityName },
// 			{
// 				main: apiData.weather[0].main,
// 				country: apiData.sys.country,
// 				description: apiData.weather[0].description,
// 				icon: apiData.weather[0].icon,
// 				temp: apiData.main.temp,
// 				feels_like: apiData.main.feels_like,
// 				tempMin: apiData.main.temp_min,
// 				tempMax: apiData.main.temp_max,
// 				humidity: apiData.main.humidity,
// 				wind: apiData.wind.speed,
// 				clouds: apiData.clouds.all,
// 				rain: apiData.rain ? apiData.rain['1h'] : 0,
// 				snow: apiData.snow ? apiData.snow['1h'] : 0,
// 				sunrise: apiData.sys.sunrise,
// 				sunset: apiData.sys.sunset,
// 				latitude: apiData.coord.lat,
// 				longitude: apiData.coord.lon,
// 				timezone: apiData.timezone,
// 			},
// 			{ new: true } // Return the updated document
// 		);
// 	}
// };


// Update all saved cities
// router.get('/updateAll', async (req, res) => {
// 	try {
// 		const cities = await City.find({});
// 		const updatePromises = cities.map(city => updateCityWeather(city.cityName));
// 		await Promise.all(updatePromises);
// 		console.log("All cities updated successfully");
// 		res.json({ result: true, message: 'All cities updated successfully' });
// 	} catch (error) {
// 		console.error("Error updating cities:", error);
// 		res.json({ result: false, error: error.message });
// 	}
// });


// Update weather data for a specific city in user's list
const updateCityWeatherForUser = async (cityName, cities, country) => {
	const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}&units=metric`);
	const apiData = await response.json();

	if (apiData.cod === 200) {
		const city = cities.find(city => city.cityName === cityName && city.country === country);

		if (city) {
			city.main = apiData.weather[0].main;
			city.country = apiData.sys.country;
			city.description = apiData.weather[0].description;
			city.icon = apiData.weather[0].icon;
			city.temp = apiData.main.temp;
			city.feels_like = apiData.main.feels_like;
			city.tempMin = apiData.main.temp_min;
			city.tempMax = apiData.main.temp_max;
			city.humidity = apiData.main.humidity;
			city.wind = apiData.wind.speed;
			city.clouds = apiData.clouds.all;
			city.rain = apiData.rain ? apiData.rain['1h'] : 0;
			city.snow = apiData.snow ? apiData.snow['1h'] : 0;
			city.sunrise = apiData.sys.sunrise;
			city.sunset = apiData.sys.sunset;
			city.latitude = apiData.coord.lat;
			city.longitude = apiData.coord.lon;
			city.timezone = apiData.timezone;
		}
	}
};

// Update weather data for cities in user's list
router.get('/updateUserCities', async (req, res) => {
	try {
		const user = await User.findOne({ token: req.query.token }).populate('cities');

		if (!user) {
			console.log('User not found for token:', req.query.token);
			return res.json({ result: false, error: 'User not found' });
		}

		const updatePromises = user.cities.map(city => updateCityWeatherForUser(city.cityName, user.cities));
		await Promise.all(updatePromises);

		await user.save();

		res.json({ result: true, message: 'All cities updated successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ result: false, error: 'Internal Server Error' });
	}
});



// Get user's cities
router.get('/userCities', async (req, res) => {
	try {
		const user = await User.findOne({ token: req.query.token }).populate('cities');
		if (!user) {
			return res.json({ result: false, error: 'User not found' });
		}

		res.json({ result: true, cities: user.cities });
	} catch (error) {
		console.error(error);
		res.status(500).json({ result: false, error: 'Internal Server Error' });
	}
});

// Add city to user's list
router.post('/addCity', async (req, res) => {
	try {
		// Authenticate user by token
		const user = await User.findOne({ token: req.body.token });
		if (!user) {
			return res.json({ result: false, error: 'User not found' });
		}

		let apiData;

		// Fetch weather data based on cityName an country or lat/lon
		if (req.body.cityName && req.body.country) {
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName},${req.body.country}&appid=${OWM_API_KEY}&units=metric`);
			apiData = await response.json();
		} else if (req.body.lat && req.body.lon) {
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lon}&appid=${OWM_API_KEY}&units=metric`);
			apiData = await response.json();
		} else {
			return res.json({ result: false, error: 'Missing cityName or lat/lon in request body' });
		}

		// Check if city already exists in the database
		const existingCity = user.cities.find(city => city.cityName.toLowerCase() === apiData.name.toLowerCase()
			&& city.country.toLowerCase() === apiData.sys.country.toLowerCase());

		if (existingCity) {
			return res.json({ result: false, error: 'City already exists in the database' });
		}

		// Create a new city object
		const newCity = {
			cityName: apiData.name,
			country: apiData.sys.country,
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
			latitude: apiData.coord.lat,
			longitude: apiData.coord.lon,
			timezone: apiData.timezone,
		};

		// Add the new city to user's cities
		user.cities.push(newCity);
		await user.save();

		// Return success response with the user's cities
		res.json({ result: true, cities: user.cities });
	} catch (error) {
		console.error('Error:', error.message);
		res.status(500).json({ result: false, error: 'Internal Server Error' });
	}
});

// get city forecast
router.get('/forecast/:cityName', async (req, res) => {
	const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${req.params.cityName}&appid=${OWM_API_KEY}&units=metric`);
	const apiData = await response.json();
	if (apiData.cod !== '200') {
		res.json({ result: false, error: apiData.message });
		return;
	} else {
		res.json({ result: true, weather: apiData });
	}
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
