var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authenticator = require('authenticator');
var QRCode = require('qr-image');
var bodyParser = require('body-parser');
var face_rec2 = require('./face-rec.js');
var db = require('../server/db').getDatabase();

const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');
const mainPath = 'images';

const saltRounds = 10;

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
    let trustValue = req.session.entry.trustValue;
    return trustValue >= value;
}

router.get('/', function(req, res) {
    let config = {
        "message" : ""
    }
    if(req.session.authenticated === false) {
        config.message = "Incorrect login credentials. Try again."
        req.session.authenticated = null;
    }
    return res.render('index', config); 
});

router.get('/facerec', requireLogin, function (req, res) {
    if (sufficientlyTrusted(req, 1)) {
        res.render('verify_face');
    } else {
        res.redirect('profile');
    }
})

router.get('/faceadd', requireLogin, function(req, res) {
    return res.render('face');
})

router.get('/signup', function(req, res) {
    let config = {
        "message" : ""
    }
    if(req.session.valid === false) {
        config.message = "Account already exist/taken"
        req.session.valid = null;
    }
    if(req.session.cpassword === false) {
        config.message = "Passwords do not match"
        req.session.cpassword = null;
    }
    return res.render('register', config);
});

router.get('/profile', requireLogin, function(req, res) {
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

router.post('/faceadd', requireLogin, function(req, res) {
    console.log('starting training');
    var modelState = face_rec2.trainSingle(req.session.user, req.body);
    req.session.entry.trustvalue = 1;
    db.insert(req.session.entry, function(err, body, header) {
        res.redirect('/profile');
    });
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
            res.redirect('verify_face');
        }
    } catch (err) {
        console.log(err);
    }
})

router.post('/', function(req, res) {
    console.log(req.body);
    
    db.get(req.body.username, function (err, body, headers) {
        req.session.isadmin = false;
        req.session.authenticated = false;

        if (!err) {
            console.log(body);
            console.log(body.password);
            let hash = bcrypt.hashSync(req.body.password, body.salt);
    
            if (body.password === hash) {
                console.log("password is verified");
                var formattedToken = authenticator.generateToken(body.qrkey);
                if (formattedToken === req.body.code) {
                    console.log("token submitted is correct");
                    req.session.user = req.body.username;
                    
                    if (req.body.username === "admin") {
                        req.session.isadmin = true;
                    }

                    req.session.authenticated = true;
                }
                else {
                    console.log('Invalid token number used');
                }
            } else {
                console.log("password is incorrect");
            }
        } else {
            console.log("No such file found")
        }

        if (req.session.authenticated) {
            if (req.session.isadmin) {
                res.redirect('/adminprofile');
            } else {
                res.redirect('profile');
            }
        } else {
            res.redirect('/');
        }
    });
});

router.get('/adminprofile', function(req, res) {
    console.log(req.session.isadmin);
    console.log(req.session.user);
    if ((req.session.isadmin == false || req.session.isadmin == undefined) && (req.session.user != null || req.session.user == undefined)) {
        return res.redirect('/profile');
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

router.post('/signup', function(req, res) {
    let genSalt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(req.body.password, genSalt);
    var formattedKey = authenticator.generateKey();
    
    var uri = authenticator.generateTotpUri(formattedKey, req.body.username, "KYC IBM", 'SHA1', 6, 30);
    console.log(uri);
    
    var tag2 = QRCode.imageSync(uri, {type: 'svg', size: 10});
    if (req.body.password === req.body.confirmPassword) {
        console.log(req.body);
        
        // must check if database contains entry
        db.get(req.body.username, function(err, body, headers)  {
            req.session.valid = false;
            req.session.cpassword = false;
            if (err) {
                let entry = {
                    "username": req.body.username,
                    "password": hash,
                    "qrkey": formattedKey,
                    "salt": genSalt,
                    "trustvalue": 0
                };
                db.insert(entry, req.body.username, function (err, body, headers) {
                    console.log("trying to add user info");
                    if (!err) {
                        req.session.valid = true;
                        
                    }
                })
            } else {
                console.log('Account exists');
            }

            if (req.session.valid) {
                return res.render('setup-2fa', {
                    qr: tag2
                });
            } else {
                req.session.cpassword = true;
                res.redirect('/signup');
                
            }
        })
    }
    else {
        req.session.cpassword = false;
        res.redirect('/signup');
    }
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
            res.redirect('/profile');
        });
    } else {
        res.redirect('/profile');
    }
})


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


module.exports = router;