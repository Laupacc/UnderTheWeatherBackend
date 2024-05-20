var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

// Get all cities from API for autocomplete feature
router.get('/cityAutoFeature', async (req, res) => {
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/find&appid=${OWM_API_KEY}&units=metric`);
        if (!response.ok) {
            res.json({ result: false, error: 'An error occurred while fetching the city names' });
            return;
        }
        const apiData = await response.json();

        let cities = [];
        apiData.list.forEach((city) => {
            const cityName = city.name;
            const country = city.sys.country;

            cities.push({ name: cityName, country: country });
        });

        // Sort cities alphabetically
        cities.sort((a, b) => a.name.localeCompare(b.name));

        res.json({ result: true, cities: cities });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Internal Problem' });
    }
});




module.exports = router;
