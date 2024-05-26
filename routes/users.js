var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const City = require('../models/cities');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


// Sign up a new user
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

// Sign in an existing user
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


// Get user's cities
router.get('/userCities', async (req, res) => {
    try {
        const user = await User.findOne({ token: req.query.token }).populate('cities');
        if (!user) {
            return res.json({ result: false, error: 'User not found' });
        }

        res.json({ result: true, cities: user.cities });
    } catch (error) {
        console.error("Error fetching user cities:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ result: false, error: 'Internal Server Error' });
    }
});

module.exports = router;