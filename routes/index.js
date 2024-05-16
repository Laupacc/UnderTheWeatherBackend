var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

// Get all cities from API for autocomplete feature in frontend header
router.get('/cityautocomplete', async (req, res) => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        if (!response.ok) {
            res.json({ result: false, error: 'An error occurred while fetching the city names' });
            return;
        }
        const apiData = await response.json();

        const citiesWithCodes = [];
        apiData.data.forEach((country) => {
            const countryCode = country.iso2;
            const countryCities = country.cities.map(city => ({ name: city, iso2: countryCode }));
            citiesWithCodes.push(...countryCities);
        });

        // Sort cities alphabetically
        citiesWithCodes.sort((a, b) => a.name.localeCompare(b.name));

        res.json({ result: true, cities: citiesWithCodes });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Internal Server Error' });
    }
});


module.exports = router;
