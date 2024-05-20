var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

// Get all cities from API for autocomplete feature in frontend header
// router.get('/cityautocomplete', async (req, res) => {
//     try {
//         const response = await fetch('https://countriesnow.space/api/v0.1/countries');
//         if (!response.ok) {
//             res.json({ result: false, error: 'An error occurred while fetching the city names' });
//             return;
//         }
//         const apiData = await response.json();

//         let cities = [];
//         apiData.data.forEach((country) => {
//             const countryCode = country.iso2;
//             const countryCities = country.cities;

//             const countryCitiesMapped = countryCities.map((city) => {
//                 return { name: city, iso2: countryCode };
//             });

//             cities = [...cities, ...countryCitiesMapped];
//         });

//         // Sort cities alphabetically
//         cities.sort((a, b) => a.name.localeCompare(b.name));

//         res.json({ result: true, cities: cities });
//     } catch (error) {
//         console.error(error);
//         res.json({ result: false, error: 'Internal Server Error' });
//     }
// });


// Get all cities from API for autocomplete feature
router.get('/cityautocomplete', async (req, res) => {
    try {
        const cityName = req.query.cityName; // Get cityName from query parameters
        if (!cityName) {
            res.json({ result: false, error: 'City name is required' });
            return;
        }

        const response = await fetch(`http://api.openweathermap.org/data/2.5/find?q=${cityName}&appid=${OWM_API_KEY}&units=metric`);
        if (!response.ok) {
            res.json({ result: false, error: 'An error occurred while fetching the city names' });
            return;
        }
        const apiData = await response.json();

        if (!apiData.list) {
            res.json({ result: false, error: 'No cities found' });
            return;
        }

        const cities = apiData.list.map(city => ({
            name: city.name,
            country: city.sys.country
        }));

        cities.sort((a, b) => a.name.localeCompare(b.name));
        res.json({ result: true, cities: cities });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Internal Server Error' });
    }
});








module.exports = router;
