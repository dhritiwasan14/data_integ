var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authenticator = require('authenticator');

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


router.post('/', function(req, res) {
    console.log(req.body);
    db.get({"username": "Benedict"}, function (err, body, headers) {
        if (!err) {
          console.log(body);
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
    return res.render('index');
});


router.get('/profile', function(req, res) {
    return res.render('profile');
});


router.post('/signup', function(req, res) {
    var hash = bcrypt.hashSync(req.body.password, salt);
    if (req.body.password === req.body.confirmPassword) {
        console.log(req.body);

        // must check if database contains entry

        db.insert({"username": req.body.username, "password": hash}, function (err, body, headers) {
            console.log("trying to add user info");
            if (!err) {
                console.log(body);
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


module.exports = router;