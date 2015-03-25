var promise = require('bluebird');

module.exports = {
    forUser: forUser
};

function forUser(user) {
    'use strict';

    let projects = [
        {
            id: 'project1',
            name: 'project1'
        },
        {
            id: 'project2',
            name: 'project2'
        }
    ];

    return promise.resolve().then(function() {
        return projects;
    });
}
