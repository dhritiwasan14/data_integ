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

router.get('/', function(req, res) {
    return res.render('index'); 
});

router.get('/facerec', requireLogin, function (req, res) {
    return res.render('verify_face');
})

router.get('/faceadd', requireLogin, function(req, res) {
    return res.render('face');
})

router.get('/signup', function(req, res) {
    return res.render('register');
});

router.get('/profile', requireLogin, function(req, res) {
    return res.render('profile');
});

router.post('/faceadd', requireLogin, function(req, res) {
    console.log('starting training');
    var modelState = face_rec2.trainSingle(req.session.user, req.body);
    req.session.entry["faceRegistered"] = 1;
    db.insert(req.session.entry, function(err, body, header) {

    });
})

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
                        return res.redirect('/adminprofile');
                    }
                    req.session.isadmin = false;
                    return res.redirect('/profile');
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
    });
});

router.get('/adminprofile', function(req, res) {
    if (req.session.isadmin == false && req.session.user != null) {
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
            if (err) {
                db.insert({"username": req.body.username, "password": hash, "qrkey":formattedKey, "salt": genSalt}, req.body.username, function (err, body, headers) {
                    console.log("trying to add user info");
                    if (!err) {
                        return res.render('setup-2fa', {
                            qr: tag2
                        })
                    }
                })
            } else {
                console.log('Account exists');
            }
        })
    }
    else {
        // error must be reported
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