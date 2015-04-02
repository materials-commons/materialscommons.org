var promise = require('bluebird');
var getSingle = require('./get-single');
var projects = require('./data').projects;

module.exports = {
    forUser: forUser,
    get: get
};

function forUser(user) {
     return promise.resolve().then(function() {
        return projects;
    });
}

function get(id, index) {
    'use strict';
    return new Promise(function(resolve, reject) {
        let project = getSingle(projects, id, index);
        resolve(project);
    });
}
