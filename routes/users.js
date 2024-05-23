var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
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



module.exports = router;



// var express = require('express');
// var router = express.Router();

// const fetch = require('node-fetch');
// const User = require('../models/users');
// const { checkBody } = require('../modules/checkBody');


// router.post('/signup', (req, res) => {
//     const name = req.body.name;
//     const email = req.body.email;
//     const password = req.body.password

//     if (!email || !password || email.trim() === '' || password.trim() === '') {
//         return res.json({ result: false, error: 'Missing or empty fields' });
//     }
//     User.findOne({ email: email }).then(user => {
//         if (user) {
//             res.json({ result: false, error: 'User already exists' })
//         } else {
//             const newUser = new User({
//                 name: name,
//                 email: email,
//                 password: password
//             });
//             newUser.save().then(() => {
//                 res.json({ result: true });
//             })
//         }
//     });
// });


// router.post('/signin', (req, res) => {
//     const name = req.body.name;
//     const email = req.body.email;
//     const password = req.body.password

//     if (!email || !password || email.trim() === '' || password.trim() === '') {
//         return res.json({ result: false, error: 'Missing or empty fields' });
//     }
//     User.findOne({ email: email }).then(user => {
//         if (!user) {
//             res.json({ result: false, error: 'User not found' })
//         } else {
//             res.json({ result: true });
//         }
//     })
// });




// module.exports = router;
