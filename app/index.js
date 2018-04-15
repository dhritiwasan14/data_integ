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
app.use(express.static(path.join(__dirname, '/public')));
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
app.use('/admin', admin);

// Login and registration routes
app.get('/', function(req, res) {
    res.redirect('/login');
});

app.get('/:status(login|failed)', function(req, res) {
    if (req.session.user) {
        if (!req.session.isadmin) {
            res.redirect('/user');
            return;
        } else {
            res.redirect('/admin/adminprofile');
            return;
        }
    }

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

        // token check
        let formattedToken = authenticator.generateToken(body.qrkey);
        if (formattedToken === req.body.code) {
            tokenMatch = true;
        }

        if (req.body.username === 'admin') {
            isAdmin = true;
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
                res.redirect('/admin/adminprofile');
            } else {
                res.redirect('/user');
            }
        } else {
            res.redirect('/failed');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', {"message" : ""});
});

app.get('/register/:status(notmatching|taken)', function(req, res) {
    let message;
    switch(req.params.status) {
        case 'notmatching':
            message = "Passwords do not match";
            break;
        case 'taken':
            message = "Account already exist";
            break;
        default:
            message = "";
    }

    let config = {
        "message" : message
    }
    res.render('register', config);
});

app.post('/register', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    // checks if passwords corresponds
    if (password !== confirmPassword) {
        console.log("Registration. Password don't match.");
        res.redirect('/register/notmatching');
        return;
    }

    db.get(username, (err, body) => {
        // checks if username already exists
        if (!err) {
            console.log("Registration. Username taken.");
            res.redirect('/register/taken');
            return;
        }

        const saltRounds = 10;
        let genSalt = bcrypt.genSaltSync(saltRounds);
        var hash = bcrypt.hashSync(password, genSalt);

        var formattedKey = authenticator.generateKey();
        var uri = authenticator.generateTotpUri(formattedKey, username, "KYC IBM", 'SHA1', 6, 30);
        var tag2 = QRCode.imageSync(uri, {type: 'svg', size: 10});

        let entry = {
            "username": username,
            "password": hash,
            "qrkey": formattedKey,
            "salt": genSalt,
            "trustvalue": 0, 
            "country":req.body.country, 
            "phone": req.body.phone, 
            "name": req.body.name
        };
        db.insert(entry, username, function (err, body, headers) {
            if (!err) {
                console.log("Registration. Added " + username);
                res.render('setup-2fa', {
                    qr: tag2
                });
            }
        });
    });
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

app.listen(3000, '127.0.0.1');
console.log('Server initialized');
