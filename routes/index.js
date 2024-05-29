var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');
const User = require('../models/users');


// Get all cities from API for autocomplete feature in frontend header
router.get('/cityautocomplete', async (req, res) => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        if (!response.ok) {
            res.json({ result: false, error: 'An error occurred while fetching the city names' });
            return;
        }
        const apiData = await response.json();

        let cities = [];
        apiData.data.forEach((country) => {
            const countryCode = country.iso2;
            const countryCities = country.cities;

            const countryCitiesMapped = countryCities.map((city) => {
                return { name: city, iso2: countryCode };
            });

            cities = [...cities, ...countryCitiesMapped];
        });

        // Sort cities alphabetically
        cities.sort((a, b) => a.name.localeCompare(b.name));

        res.json({ result: true, cities: cities });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Internal Server Error' });
    }
});


// Delete city from user's list
router.delete('/deleteCity', async (req, res) => {
    try {
        // Authenticate user by token
        const user = await User.findOne
            ({
                token
                    : req.body.token
            }).populate('cities');
        if (!user) {
            return res.json({ result: false, error: 'User not found' });
        }

        // Find city by name in user's cities
        const cityIndex = user.cities.findIndex(city => city.cityName.toLowerCase() === req.body.cityName.toLowerCase() && city.country === req.body.country);
        if (cityIndex === -1) {
            return res.json({ result: false, error: 'City not found in user\'s list' });
        }

        // Remove city from user's cities
        user.cities.splice(cityIndex, 1);
        await user.save();

        // Return success response with the user's cities
        res.json({ result: true, cities: user.cities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: 'Internal Server Error' });
    }
});



module.exports = router;
