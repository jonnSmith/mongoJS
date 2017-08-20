import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';
import Strategy from 'passport-local'
import session from 'express-session'
import fileUpload from 'express-fileupload'

import stylus from 'express-stylus';
import nib from 'nib';
import coffee from 'express';

import auth from './auth';
import index from './routes/index';
import db from './routes/db';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/assets/bootstrap', express.static(path.join(__dirname , 'node_modules/bootstrap/dist')));
app.use('/assets/icons', express.static(path.join(__dirname , 'node_modules/font-awesome')));
app.use('/assets/jquery', express.static(path.join(__dirname , 'node_modules/jquery/dist')));
app.use('/assets/tether', express.static(path.join(__dirname , 'node_modules/tether/dist')));

app.use(stylus({
    src: path.join(__dirname, 'public/css'),
    use: [nib()],
    import: ['nib']
}));

app.use(coffee({
    dest: path.join(__dirname, 'public/js'),
    src: path.join(__dirname, 'public/js'),
    prefix: '/js'
}));

passport.use(new Strategy(
    function(username, password, cb) {
        auth.users.findByUsername(username, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            if (user.password != password) { return cb(null, false); }
            return cb(null, user);
        });
    })
);
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    auth.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

app.use(fileUpload());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/admin/db', db);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
