import express from 'express';
import passport from 'passport';
import config from '../config.json';
import MongoClient from 'mongodb';
const mongoDB = config.mongoDB;
const loginsCollection = 'logins';

let router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {title: config.name+': v'+config.version });
});

router.get('/login', function (req, res, next) {
    res.render('index', {title: 'Login' });
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        MongoClient.connect(mongoDB, function(err, db) {
            if (err) {
                res.json({error_description: err.code});
                return;
            }
            const collection = db.collection(loginsCollection);
            collection.insert(req.body, function(err){
                if (err) {
                    res.json({error_description: err.code});
                    return;
                }
                res.redirect('/admin/db/download');
            });
        });
    }
);

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
