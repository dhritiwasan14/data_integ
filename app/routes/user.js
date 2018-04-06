const express = require('express');
const router = express.Router();
const face_rec2 = require('../server/face-rec.js');
const db = require('../server/db').getDatabase();

const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');

const saltRounds = 10;

router.get('/facerec', requireLogin, function (req, res) {
    if (sufficientlyTrusted(req, 1)) {
        res.render('facerec');
    } else {
        res.redirect('/');
    }
});

router.post('/facerec', requireLogin, function(req, res) {
    console.log('testing image');
    var bestPrediction = face_rec2.predictIndividual(req.body.value);
    try {
        if (bestPrediction === req.session.user) {
            req.session.time = Date.now();
            console.log('face matched');
            res.redirect('submit');
        } else {
            console.log('facial recognition failed');
            res.redirect('facerec');
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/faceadd', requireLogin, function(req, res) {
    return res.render('faceadd');
})

router.post('/faceadd', requireLogin, function(req, res) {
    console.log('starting training');
    var modelState = face_rec2.trainSingle(req.session.user, req.body);
    req.session.entry.trustvalue = 1;
    db.insert(req.session.entry, function(err, body, header) {
        res.redirect('/');
    });
});

router.get('/', requireLogin, function(req, res) {
    let value = req.session.entry.trustvalue;
    let config = {
        "document" : "disabled"
    };
    console.log("Trust value is: " + value);
    switch(value) {
        case 2:
        case 1:
            config.document = "";
    }

    res.render('profile', config);
});

router.get('/logout', requireLogin, function(req, res) {
    req.session.regenerate((err) => {
        res.redirect('/');
    })
});

router.get('/submit', requireLogin, function(req, res) {
    return res.render('submit');
})

router.post('/submit', requireLogin, function(req, res) {
    let timeElapsed = Date.now() - req.session.time;
    if (timeElapsed < 1000 * 60 * 3) { // time limit of 3 minutes
        req.session.entry['document'] = req.body.value;
        db.insert(req.session.entry, function(err, body) {
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
})

// admin pages
router.get('/adminprofile', function(req, res) {
    console.log(req.session.isadmin);
    console.log(req.session.user);
    if ((req.session.isadmin == false || req.session.isadmin == undefined) && (req.session.user != null || req.session.user == undefined)) {
        return res.redirect('/');
    } else if (req.session.isadmin == false) {
        return res.redirect('/login');
    }
    var users = [];
    db.list(function(errnew, bodynew) {
        var users = [];
        if (!errnew) {
            bodynew.rows.forEach(function(docnew) {
            console.log(docnew);
            users.push(docnew);
            });
        }
        res.render('adminprofile', {
            users: users
        });
    });
    
    
});

router.get('/showUser/:id', function (req, res) {
    console.log(req.params.id);
    db.get(req.params.id, function (err, body, headers) {
        if (!err) {
            return res.render('display_user', {
                userid: body.username, 
                password: body.password, 
                qrkey: body.qrkey, 
                salt: body.salt, 
                document: body.document
            })
        } else {
            console.log('encountered an error'+err);
        }
    })
});

// helper functions
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        db.get(req.session.user, function(err, body, header) {
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
}

function sufficientlyTrusted(req, value) {
    let trustValue = req.session.entry.trustvalue;
    console.log(trustValue);
    return trustValue >= value;
}

module.exports = router;