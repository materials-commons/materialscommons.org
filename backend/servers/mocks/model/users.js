var getSingle = require('./get-single');
var promise = require('bluebird');
var users = require('./data').users;

module.exports = {
    getUsers: getUsers,
    get: get
};

function getUsers() {
    return promise.resolve().then(function() {
        return users;
    });
}

function get(id, index) {
    'use strict';

    return new Promise(function(resolve, reject) {
        let user = getSingle(users, id, index);
        resolve(user);
    });
}
