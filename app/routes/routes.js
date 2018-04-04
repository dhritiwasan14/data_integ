var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authenticator = require('authenticator');
var cookieSession = require('cookie-session');
var QRCode = require('qr-image');
var bodyParser = require('body-parser');
var face_rec2 = require('./face-rec.js');
// var hello_world = require('./hello.js');
const saltRounds = 10;
const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');
const mainPath = 'images';

const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();
require('dotenv').load();

var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;

var url = 'https://58dce9f5-340c-4123-93a2-19fb379d26a7-bluemix:0a5c5e9b39efbd7f725d6d9f758385f6237578d58479e793b73de7822df0d1e5@58dce9f5-340c-4123-93a2-19fb379d26a7-bluemix.cloudant.com';
// var url = "https://"+username+":"+password+"@"+username+".cloudant.com"

// var testcreated = require('cloudant-quickstart')(url, 'testcreated');
var salt = bcrypt.genSaltSync(saltRounds);
var nano = require('nano');
var account = nano(url);
var cloudant = nano("https://"+username+".cloudant.com");
var db = account.use('user_details');


account.request(function (err, body) {
    if (!err) {
        console.log(body);
    }
});

  
cloudant.auth(username, password, function (err, body, headers) {
    if (!err) {
        cookies[username] = headers['set-cookie'];
        cloudant = nano({
            url: "https://"+username+".cloudant.com",
            cookie: cookies[username]
        });

        // ping to ensure we're logged in
        cloudant.request({
            path: 'test_porter'
        }, function (err, body, headers) {
            if (!err) {
                console.log(body, headers);
            }
            else {
                console.log("Could not connect to server.")
            }
        });
    }
});


router.get('/', function(req, res) {

    return res.render('index'); 
});

router.get('/face', function(req, res) {
    return res.render('face');
})

router.post('/face', function(req, res) {
    console.log('starting training');
    var modelState = face_rec2.trainSingle('name', req.body);
    console.log(modelState);
    
})

router.post('/', function(req, res) {
    console.log(req.body);
    var hash = bcrypt.hashSync(req.body.password, salt);
    

    db.get(req.body.username, function (err, body, headers) {
        if (!err) {
            console.log(body);
            console.log(body.password);
            console.log(hash);
          if (body.password === hash) {
                console.log("password is verified");
                var formattedToken = authenticator.generateToken(body.qrkey);
                // "957 124"
                
                if (authenticator.verifyToken(body.qrkey, formattedToken)!= null) {
                // { delta: 0 }
                    console.log("token submitted is correct");
                    return res.redirect('/profile');
                }
                else {
                    console.log('Invalid token number used');
                }
          } else {
              console.log("password is incorrect");
          }
        }
        else {
          console.log("No such file found")
        }
      });
});


router.get('/signup', function(req, res) {
    return res.render('register');
});


router.get('/login', function(req, res) {
    return res.render('face');
});


router.get('/profile', function(req, res) {
    return res.render('profile');
});


router.post('/signup', function(req, res) {
    var hash = bcrypt.hashSync(req.body.password, salt);
    var formattedKey = authenticator.generateKey();
    
    var uri = authenticator.generateTotpUri(formattedKey, req.body.username, "ACME Co", 'SHA1', 6, 30);
    console.log(uri);

    var tag2 = QRCode.imageSync(uri, {type: 'svg', size: 10});
    if (req.body.password === req.body.confirmPassword) {
        console.log(req.body);

        // must check if database contains entry
        db.get(req.body.username, function(err, body, headers)  {
            if (err) {
                app.use(cookieSession({
                    name: 'session',
                    keys: [req.body.username],
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                }));
                db.insert({"username": req.body.username, "password": hash, "qrkey":formattedKey}, req.body.username, function (err, body, headers) {
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


router.get('/logout', function(req, res) {
    return res.render('index');
});

router.get('/fv', function(req, res) {
    return res.render('fv');
});

router.post('/receivedImage', function(req, res) {
    // TODO: use the request to check whether the face data matches
    let match = true;
    if (match) {
        res.status(200);
        res.send({ redirect: 'submit'})
    } else {
        res.status(202);
        res.send("Authentication Failed");
    }
})

router.get('/submit', function(req, res) {
    res.render('submit');
})

router.post('/documents', function(req, res) {
    // TODO: store the image into the database
    console.log(req.body);
})

module.exports = router;