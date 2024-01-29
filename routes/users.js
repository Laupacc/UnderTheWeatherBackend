var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');


router.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password

    if (!email || !password || email.trim() === '' || password.trim() === '') {
        return res.json({ result: false, error: 'Missing or empty fields' });
    }
    User.findOne({ email: email }).then(user => {
        if (user) {
            res.json({ result: false, error: 'User already exists' })
        } else {
            const newUser = new User({
                name: name,
                email: email,
                password: password
            });
            newUser.save().then(() => {
                res.json({ result: true });
            })
        }
    });
});


router.post('/signin', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password

    if (!email || !password || email.trim() === '' || password.trim() === '') {
        return res.json({ result: false, error: 'Missing or empty fields' });
    }
    User.findOne({ email: email }).then(user => {
        if (!user) {
            res.json({ result: false, error: 'User not found' })
        } else {
            res.json({ result: true });
        }
    })
});




module.exports = router;
