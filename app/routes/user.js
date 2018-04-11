const express = require('express');
const router = express.Router();
const face_rec2 = require('../server/face-rec.js');
const db = require('../server/db').getDatabase();

const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');

// helper functions
function sufficientlyTrusted(req, value) {
    let trustValue = req.session.entry.trustvalue;
    return trustValue >= value;
}

// middleware
router.use((req, res, next) => {
    if (req.session && req.session.user) {
        db.get(req.session.user, function (err, body, header) {
            if (err) {
                res.redirect('/');
            } else {
                req.session.entry = body;
                next();
            }
        });
    } else {
        res.redirect('/');
    }
});


// routes
router.get('/facerec', function (req, res) {
    if (sufficientlyTrusted(req, 1)) {
        res.render('facerec', { 'message': '' });
    } else {
        res.redirect('/');
    }
});

router.get('/facerec/failed', function (req, res) {
    res.render('facerec', { 'message': 'An error has occurred. Please ensure there is only one face taken' });
});


router.get('/profile', function (req, res) {
    db.get(req.session.user, function (err, body, header) {
        if (err) {
            res.redirect('/');
        } else {
            res.render('main', {
                entry: body
            });
        }
    })

})


router.post('/facerec', function (req, res) {
    console.log('testing image');
    var bestPrediction = face_rec2.predictIndividual(req.body.value);
    if (bestPrediction == null) {
        res.redirect('/user/facerec/failed');
    } else {
        try {
            if (bestPrediction === req.session.user) {
                req.session.time = Date.now();
                console.log('face matched');
                res.redirect('/user/submit');
            } else {
                console.log('facial recognition failed');
                res.redirect('/user/facerec');
            }
        } catch (err) {
            console.log(err);
        }
    }
});

router.get('/faceadd', function (req, res) {
    res.render('faceadd', { 'message': '' });
});

router.get('/faceadd/failed', function (req, res) {
    res.render('faceadd', { 'message': 'No face/multiple faces detected, please try again' });
});

router.post('/faceadd', function (req, res) {
    console.log('starting training');
    var modelState = face_rec2.trainSingle(req.session.user, req.body.image);
    if (Object.keys(modelState).length === 0) {
        res.redirect('/user/faceadd/failed');
    } else {
        req.session.entry.trustvalue = 1;
        db.insert(req.session.entry, function (err, body, header) {
            res.redirect('/user');
        });
    }
});

router.get('/', function (req, res) {
    let value = req.session.entry.trustvalue;
    let config = {
        "document": "disabled"
    };
    console.log("Trust value is: " + value);
    switch (value) {
        case 2:
        case 1:
            config.document = "";
    }

    res.render('profile', config);
});

router.get('/logout', function (req, res) {
    req.session.regenerate((err) => {
        res.redirect('/');
    })
});

router.get('/submit', function (req, res) {
    return res.render('submit');
})

router.post('/submit', function (req, res) {
    let timeElapsed = Date.now() - req.session.time;
    if (timeElapsed < 1000 * 60 * 3) { // time limit of 3 minutes
        req.session.entry['document'] = req.body.image;
        db.insert(req.session.entry, function (err, body) {
            res.redirect('/user');
        });
    } else {
        res.redirect('/user');
    }
})

module.exports = router;
