import config from '../config.json';

exports.findById = function(id, cb) {
    process.nextTick(function() {
        let idx = id - 1;
        if (config.users[idx]) {
            cb(null, config.users[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
};

exports.findByUsername = function(username, cb) {
    process.nextTick(function() {
        for (let i = 0, len = config.users.length; i < len; i++) {
            let record = config.users[i];
            if (record.username === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
};
