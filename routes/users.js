var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const City = require('../models/cities');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
    if (!checkBody(req.body, ['username', 'password'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    // Check if the user has not already been registered
    User.findOne({ username: req.body.username }).then(data => {
        if (data === null) {
            const hash = bcrypt.hashSync(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hash,
                token: uid2(32),
                cities: [],
            });

            newUser.save().then(newDoc => {
                res.json({ result: true, token: newDoc.token });
            });
        } else {
            // User already exists in database
            res.json({ result: false, error: 'User already exists' });
        }
    });
});

router.post('/signin', (req, res) => {
    if (!checkBody(req.body, ['username', 'password'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    User.findOne({ username: req.body.username }).then(data => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
            res.json({ result: true, token: data.token });

        } else {
            res.json({ result: false, error: 'User not found or wrong password' });
        }
    });
});

// router.post('/addCity', (req, res) => {
//     if (!checkBody(req.body, ['username', 'cityName'])) {
//         res.json({ result: false, error: 'Missing or empty fields' });
//         return;
//     }

//     User.findOne({ username: req.body.username }).then(user => {
//         if (user) {
//             City.findOne({ cityName: req.body.cityName }).then(city => {
//                 if (city) {
//                     if (user.cities.includes(city._id)) {
//                         res.json({ result: false, error: 'City already in list' });
//                         return;
//                     }
//                     user.cities.push(city._id);
//                     user.save().then(() => {
//                         res.json({ result: true, message: 'City added successfully' });
//                     }).catch(err => {
//                         res.json({ result: false, error: err.message });
//                     });
//                 } else {
//                     res.json({ result: false, error: 'City not found' });
//                 }
//             }).catch(err => {
//                 res.json({ result: false, error: err.message });
//             });
//         } else {
//             res.json({ result: false, error: 'User not found' });
//         }
//     }).catch(err => {
//         res.json({ result: false, error: err.message });
//     });
// });


router.post('/addCity', async (req, res) => {
    if (!checkBody(req.body, ['username', 'cityName'])) {
        return res.json({ result: false, error: 'Missing or empty fields' });
    }

    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.json({ result: false, error: 'User not found' });
        }

        const city = await City.findOne({ cityName: req.body.cityName });
        if (!city) {
            return res.json({ result: false, error: 'City not found' });
        }

        if (user.cities.includes(city._id)) {
            return res.json({ result: false, error: 'City already in list' });
        }

        user.cities.push(city._id);
        await user.save();
        res.json({ result: true, message: 'City added successfully' });
    } catch (err) {
        res.json({ result: false, error: err.message });
    }
});

module.exports = router;