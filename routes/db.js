import express from 'express';
import {ensureLoggedIn} from 'connect-ensure-login';
import MongoClient from 'mongodb';
import config from '../config.json';
import assert from 'assert';
import moment from 'moment';

const Server = MongoClient.Server;
const mongoDB = config.mongoDB;
const Db = MongoClient.Db;

let router = express.Router();

let filterDB = function (dbs) {
    let fileteredDB = dbs.filter(function(db) {
        if(db.name != config.dbName) {
            return db
        }
    });
    return fileteredDB;
};

let getCollectionsData = function (collections,db) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(db, function (err, db) {
            if (err) {
                reject(new Error(err.code));
                return;
            }
            let data = {};
            for (let [index, collection] of collections.entries()) {
                db.collection(collection.name).find({}, {_id: 0}).sort().toArray(function (err, items) {
                    if (err) {
                        reject(new Error(err.code));
                    }
                    data[collection.name] = items;
                    if((index+1) == collections.length) {
                        resolve(data);
                    }
                });
            }
        });
    });
};

let processCollectionsData = function (collections,data, dataBase) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dataBase, function (err, db) {
            if (err) {
                reject(new Error(err.code));
                return;
            }
            let dbCollections = {};
            for (let [index, collection] of collections.entries()) {
                dbCollections[collection.name] = collection;
            }
            let i = 0;
            for (let key of Object.keys(data)) {
                if(dbCollections[key]) { db.collection(key).remove(); }
                let result = db.collection(key).insert(data[key]);
                result.then(function(){
                    if(i ==  Object.keys(data).length) {
                        resolve('DB UPDATED');
                    }
                }, function (error) {
                    reject(new Error(error));
                });
                i++;
            }
        });
    });
};

router.get('/download', ensureLoggedIn(), function (req, res, next) {
    const db = new Db(config.dbName, new Server(config.domain, config.mongoPort));
    db.open(function(err, db) {
        const adminDb = db.admin();
        adminDb.listDatabases(function(err, dbs) {
            assert.equal(null, err);
            assert.ok(dbs.databases.length > 0);
            db.close();
            res.render('db/download', {title: 'Database management', databases: filterDB(dbs.databases)});
        });
    });
});

let renderUpload = function(error, res) {
    const db = new Db(config.dbName, new Server('localhost', config.mongoPort));
    db.open(function(err, db) {
        const adminDb = db.admin();
        adminDb.listDatabases(function (err, dbs) {
            assert.equal(null, err);
            assert.ok(dbs.databases.length > 0);
            db.close();
            let renderData = {title: 'Database management', databases: filterDB(dbs.databases)};
            if(error)
                renderData.error = error;
            res.render('db/upload', renderData);
        });
    })
};

router.get('/upload', ensureLoggedIn(), function (req, res) {
    renderUpload(false, res)
});

router.post('/upload', ensureLoggedIn(), function (req, res, next) {
    let file = req.files.file;
    const uploadDB = config.mongoDomain + ":" + config.mongoPort + '/' + req.body.uploadDB;
    if (file && file.mimetype == 'application/json') {
        try {
            let data = JSON.parse(file.data.toString());
            MongoClient.connect(uploadDB, function(err, db) {
                if (err) {
                    renderUpload(err.code, res);
                    return;
                }
                db.listCollections().toArray(function(err, collections) {
                    if (err) {
                        console.log('EE');
                        renderUpload(err.code, res);
                        return;
                    }
                    processCollectionsData(collections,data,uploadDB).then(function (message) {
                        console.log(message);
                        renderUpload(false, res);
                    }, function (error) {
                        console.log(error);
                        renderUpload(error.code, res);
                    });
                });
            });
        } catch (ex) {
            res.render('/admin/db/upload', { error: 'FILE PROCESS ERROR'});
        }
    } else {
        res.render('/admin/db/upload', { error: 'WRONG FILE'});
    }
});

router.post('/download', ensureLoggedIn(), function (req, res, next) {
    const downloadDB = config.mongoDomain + ":" + config.mongoPort + '/' + req.body.downloadDB;
    MongoClient.connect(downloadDB, function(err, db) {
        if (err) {
            res.render('db/download', {title: 'Database management', error: err.code});
            return;
        }
        db.listCollections().toArray(function(err, collections) {
            if (err) {
                res.render('db/download', {title: 'Database management', error: err.code});
                return;
            }
            getCollectionsData(collections,downloadDB).then(function (data) {
                let date = new Date();
                date = moment(date).unix();
                let filename = req.body.downloadDB + '_' + date + '_'+'.json';
                res.set({"Content-Disposition": "attachment; filename=\"" + filename + "\""});
                res.send(data);
            }, function (error) {
                res.render('db/index', {title: 'Database management', error: error.message});
            });
        });
    });
});

module.exports = router;
