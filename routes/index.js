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

router.get('/user/:token', async (req, res) => {
    try {
        const user = await User.findOne({ token: req.params.token });
        if (!user) {
            res.json({ result: false, error: 'User not found' });
            return;
        }
        res.json({ result: true, cities: user.cities });
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;
