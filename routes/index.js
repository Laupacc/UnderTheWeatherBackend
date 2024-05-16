var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

router.get('/cityautocomplete', async (req, res) => {
	try {
		const response = await fetch('https://countriesnow.space/api/v0.1/countries');
		if (!response.ok) {
			res.json({ result: false, error: 'An error occurred while fetching the city names' });
			return;
		}
		const apiData = await response.json();

		// Extract all cities from the API response
		const cities = apiData.data.reduce((acc, country) => {
			acc.push(...country.cities);
			return acc;
		}, []);

		res.json({ result: true, cities: cities });
	} catch (error) {
		console.error(error);
		res.json({ result: false, error: 'Internal Server Error' });
	}
});

module.exports = router;
