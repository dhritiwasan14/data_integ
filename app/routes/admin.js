const router = require('express').Router();
const db = require('../server/db').getDatabase();

// middleware
router.use((req, res, next) => {
    if (req.session && req.session.user && req.session.isadmin) {
        next();
    } else {
        res.redirect('/');
    }
});

router.get('/adminprofile', function(req, res) {
    
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
    if ((req.session.isadmin == false || req.session.isadmin == undefined) && (req.session.user != null || req.session.user == undefined)) {
        return res.redirect('/');
    } else if (req.session.isadmin == false) {
        return res.redirect('/login');
    }
    console.log(req.params.id);

    db.get(req.params.id, function (err, body, headers) {
        if (!err) {
            let disabled;
            if (body.trustvalue >= 2) {
                disabled = 'disabled';
            } else {
                disabled = '';
            }

            return res.render('display_user', {
                name: body.name, 
                username: body.username, 
                country: body.country, 
                phone: body.phone, 
                trustvalue: body.trustvalue, 
                document: body.document, 
                face: body.face,
                'disabled': disabled
            })
        } else {
            console.log('encountered an error'+err);
        }
    })
});

router.post('/showUser/:id', function (req, res) {
    console.log(req.params.id);
    db.get(req.params.id, function (err, body, headers) {
        console.log(req.body);
        if (!err) {
            if (req.body === "accept") {
                if (!body.approved) {
                    body.trustvalue+=1;
                    body.approved = true;
                }

                db.insert(body, function(err, body, headers) {
                    if(err) {
                        console.log("update trust value process failed.")
                    }
                })
            } 
        } else {
            console.log('an error has occurred.'+err);
        }
    });
    return res.redirect('/showUser/'+req.params.id);
});

module.exports = router;
