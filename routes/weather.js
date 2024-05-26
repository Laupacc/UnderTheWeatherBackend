var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');
const User = require('../models/users');

const OWM_API_KEY = process.env.OWM_API_KEY;


// Update weather data for a specific city
const updateCityWeather = async (cityName) => {
	const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}&units=metric`);
	const apiData = await response.json();
	if (apiData.cod === 200) {
		// Update city document with new data
		await City.findOneAndUpdate(
			{ cityName: cityName },
			{
				main: apiData.weather[0].main,
				country: apiData.sys.country,
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
			},
			{ new: true } // Return the updated document
		);
	}
};

// Update all saved cities
router.get('/updateAll', async (req, res) => {
	try {
		const cities = await City.find({});
		const updatePromises = cities.map(city => updateCityWeather(city.cityName));
		await Promise.all(updatePromises);
		console.log("All cities updated successfully");
		res.json({ result: true, message: 'All cities updated successfully' });
	} catch (error) {
		console.error("Error updating cities:", error);
		res.json({ result: false, error: error.message });
	}
});

// Get all cities from database
router.get('/', (req, res) => {
	City.find().then(data => {
		res.json({ weather: data });
	});
});

router.get('/userCities/:userId', async (req, res) => {
	try {
		// Find the user by their ID
		const user = await User.findById(req.params.userId);

		if (!user) {
			return res.json({ result: false, error: 'User not found' });
		}

		// Retrieve the array of city IDs associated with the user
		const cityIds = user.cities;

		// Query the City collection to get details of each city
		const cities = await City.find({ _id: { $in: cityIds } });

		res.json({ result: true, cities: cities });
	} catch (error) {
		console.error(error);
		res.status(500).json({ result: false, error: 'Internal Server Error' });
	}
});


router.post('/addCity', async (req, res) => {

	try {
		// Authenticate user by token
		console.log("Token received in request:", req.body.token);
		const user = await User.findOne({ token: req.body.token });
		console.log("User found in database:", user);
		if (!user) {
			console.log("User not found in database");
			return res.json({ result: false, error: 'User not found' });
		}

		let apiData;

		// Fetch weather data based on cityName or lat/lon
		if (req.body.cityName) {
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${OWM_API_KEY}&units=metric`);
			apiData = await response.json();
		} else if (req.body.lat && req.body.lon) {
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lon}&appid=${OWM_API_KEY}&units=metric`);
			apiData = await response.json();
		} else {
			return res.json({ result: false, error: 'Missing cityName or lat/lon in request body' });
		}

		// Check if city already exists in the database
		const existingCity = await City.findOne({ cityName: { $regex: new RegExp(apiData.name, 'i') } });
		if (existingCity) {
			return res.json({ result: false, error: 'City already exists in the database' });
		}

		// Create a new City document
		const newCity = new City({
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
		});

		// Save the new city to the database
		const savedCity = await newCity.save();

		// Add the new city to user's cities
		user.cities.push(savedCity._id);
		await user.save();

		// Return success response with the newly added city data
		const populatedUser = await User.findOne({ _id: user._id }).populate('cities');
		res.json({ result: true, cities: populatedUser.cities });
	} catch (error) {
		console.error(error);
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
