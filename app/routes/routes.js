var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authenticator = require('authenticator');
var cookieParser = require('cookie-parser');
var QRCode = require('qr-image');
var bodyParser = require('body-parser');

const saltRounds = 10;
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

// var enabled = true; // A flag to know when start or stop the camera
// var WebCamera = require("webcamjs"); // Use require to add webcamjs
// WebCamera.attach('camdemo');
// // document.getElementById("start").addEventListener('click', function () {
// //     if (!enabled) { // Start the camera !
// //         enabled = true;
// //         WebCamera.attach('camdemo');
// //         console.log("The camera has been started");
// //     } else { // Disable the camera !
// //         enabled = false;
// //         WebCamera.reset();
// //         console.log("The camera has been disabled");
// //     }
// // }, false);

// // var app = require('electron').remote; 
// // var dialog = app.dialog;

// var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

// // return an object with the processed base64image
// function processBase64Image(dataString) {
//     var response = ''
//     var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};

//     if (matches.length !== 3) {
//         return new Error('Invalid input string');
//     }

//     response.type = matches[1];
//     response.data = new Buffer(matches[2], 'base64');

//     return response;
// }

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
    console.log(req.body);
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

function checkDatabase(username) {
    
}
module.exports = router;