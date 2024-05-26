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
// router.get('/', (req, res) => {
// 	City.find().then(data => {
// 		res.json({ weather: data });
// 	});
// });

// Get all cities from user database
router.get('/user/:token', async (req, res) => {
	try {
		const user = await User.findOne({ token: req.params.token }).populate('cities');
		if (!user) {
			res.json({ result: false, error: 'User not found' });
			return;
		}
		res.json({ result: true, cities: user.cities });
	} catch (error) {
		res.status(500).json({ result: false, error: error.message });
	}
});


router.post('/addCity', async (req, res) => {
	if (!checkBody(req.body, ['username', 'cityName'])) {
		return res.json({ result: false, error: 'Missing or empty fields' });
	}

	try {
		const user = await User.findOne({ username: req.body.username });
		if (!user) {
			return res.json({ result: false, error: 'User not found' });
		}

		let apiData;
		const cityName = req.body.cityName;

		const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}&units=metric`);
		apiData = await response.json();

		if (apiData.cod !== 200) {
			return res.json({ result: false, error: apiData.message });
		}

		const existingCity = await City.findOne({ cityName: { $regex: new RegExp(`^${apiData.name}$`, 'i') } });
		if (existingCity) {
			user.cities.push(existingCity._id);
			await user.save();
			const populatedUser = await User.findOne({ _id: user._id }).populate('cities');
			return res.json({ result: true, cities: populatedUser.cities });
		}

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

		const savedCity = await newCity.save();
		user.cities.push(savedCity._id);
		await user.save();

		const populatedUser = await User.findOne({ _id: user._id }).populate('cities');
		res.json({ result: true, cities: populatedUser.cities });
	} catch (error) {
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
