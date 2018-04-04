var express = require('express');
var path = require('path');
var routes = require('./routes/routes');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var app = express();
var session = require('express-session');
var database = require('./server/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({limit : '1mb'}));

// handle sessions
app.use(session({
    name: 'session',
    secret: 'fluffy-waddle',
    maxAge: 1000 * 60 * 15,
    rolling: true,
    unset: 'destroy'
}));

// Final routes to go here after configuration otherwise config would not be captured
app.use('/', routes);

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