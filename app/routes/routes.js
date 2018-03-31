var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {

    return res.render('index');
});


router.post('/', function(req, res) {

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
    return res.render('index');
});

router.get('/logout', function(req, res) {
    return res.render('index');
});



module.exports = router;