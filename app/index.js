const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const app = express();
const session = require('express-session');
const db = require('./server/db').getDatabase();
const bcrypt = require('bcrypt');
const authenticator = require('authenticator');

const user = require('./routes/user');

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
app.use('/user', user);

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