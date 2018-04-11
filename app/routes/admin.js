const router = require('express').Router();
const db = require('../server/db').getDatabase();


router.get('/adminprofile', function(req, res) {
    console.log(req.session.isadmin);
    console.log(req.session.user);
    // if ((req.session.isadmin == false || req.session.isadmin == undefined) && (req.session.user != null || req.session.user == undefined)) {
    //     return res.redirect('/');
    // } else if (req.session.isadmin == false) {
    //     return res.redirect('/login');
    // }
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
                name: body.name, 
                username: body.username, 
                country: body.country, 
                phone: body.phone, 
                trustvalue: body.trustvalue, 
                document: body.document
            })
        } else {
            console.log('encountered an error'+err);
        }
    })
});

router.post('/showUser/:id', function (req, res) {
    console.log(req.body);
});

module.exports = router;