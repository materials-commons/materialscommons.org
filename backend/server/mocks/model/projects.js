var promise = require('bluebird');
var getSingle = require('./get-single');

module.exports = {
    forUser: forUser,
    get: get
};

var projects = [
    {
        id: 'project1',
        name: 'project1'
    },
    {
        id: 'project2',
        name: 'project2'
    }
];

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
