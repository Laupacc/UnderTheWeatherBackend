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
        const response = await fetch(`http://api.openweathermap.org/data/2.5/find?q=${req.params.cityName}&appid=${OWM_API_KEY}&units=metric`);
        if (apiData.cod !== '200') {
            res.json({ result: false, error: apiData.message });
        }

        const apiData = await response.json();

        let cities = [];
        apiData.list.forEach((city) => {
            const countryName = city.sys.country;
            const countriesMapped = city.map((city) => {
                return { name: city, country: countryName };
            });
            cities = [...cities, ...countriesMapped];
        });
        cities.sort((a, b) => a.name.localeCompare(b.name));
        res.json({ result: true, cities: cities });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Internal Server Error' });
    }
});






module.exports = router;
