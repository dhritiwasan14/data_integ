const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const app = express();
const session = require('express-session');

const db = require('./server/db').getDatabase();
const bcrypt = require('bcrypt');
const authenticator = require('authenticator');
const QRCode = require('qr-image');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: '5mb', extended: false }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.text({limit : '1mb'}));

// handle sessions
app.use(session({
    name: 'session',
    secret: 'fluffy-waddle',
    maxAge: 1000 * 60 * 15,
    rolling: true,
    unset: 'destroy',
    resave: false,
    saveUninitialized: true
}));

// User and admin routes
const user = require('./routes/user');
const admin = require('./routes/admin');

app.use('/user', user);
app.user('/admin', admin);

// Login and registration routes
app.get('/', function(req, res) {
    res.redirect('/login');
});

app.get('/:status(login|failed)', function(req, res) {
    let config = {
        "message" : ""
    }
    if(req.params.status === "failed") {
        config.message = "Incorrect login credentials. Try again."
    }
    res.render('index', config);
});

app.post('/', function(req, res) {
    console.log('Login attempt');
    db.get(req.body.username, function (err, body, headers) {
        let authenticated = false;
        let tokenMatch = false;
        let isAdmin = false;

        // username check
        if (err) {
            console.log("Login: No such user found");
            res.redirect("/failed");
            return;
        }

        // password check
        let hash = bcrypt.hashSync(req.body.password, body.salt);
        if (body.password === hash) {
            authenticated = true;
        }

        // TODO: admin check

        // token check
        let formattedToken = authenticator.generateToken(body.qrkey);
        if (formattedToken === req.body.code) {
            tokenMatch = true;
        }

        console.log(
            "Login Attempt. " +
            "authenticated: " + authenticated + ". " +
            "tokenMatch: " + tokenMatch + ". " +
            "isAdmin: " + isAdmin + ". "
        )
        
        if (authenticated && tokenMatch) {
            req.session.user = req.body.username;
            req.session.isadmin = isAdmin;
            if (isAdmin) {
                res.redirect('/adminprofile');
            } else {
                res.redirect('/user');
            }
        } else {
            res.redirect('/failed');
        }
    });
});

app.get('/register/:message(.*)', function(req, res) {
    let config = {
        "message" : req.params.message
    }
    return res.render('register', config);
});

app.post('/register', function(req, res) {
    let config = {
        "message" : ""
    }

    if(req.session.valid === false) {
        config.message = "Account already exist/taken"
        req.session.valid = null;
        return res.redirect('/register', config);
    }

    if(req.session.cpassword === false) {
        config.message = "Passwords do not match"
        req.session.cpassword = null;
        return res.redirect('/register', config);
    }

    let saltRounds = 10;
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
                        return res.render('setup-2fa', {
                            qr: tag2
                        });
                    }
                })
            } else {
                console.log('Account exists');
                req.session.cpassword = true;
                res.redirect('/register');
            }
        })
    }
    else {
        req.session.cpassword = false;
        res.redirect('/register');
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3000);
console.log('Server initialized');