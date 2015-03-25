var promise = require('bluebird');

module.exports = {
    getUsers: getUsers
};

function getUsers() {
    'use strict';

    let users = [
        {
            id: 'user1',
            apikey: 'user1key',
            admin: false
        },
        {
            id: 'admin',
            apikey: 'adminkey',
            admin: true
        },
        {
            id: 'user2',
            apikey: 'user2key'
        }
    ];

    return promise.resolve().then(function() {
        return users;
    });
}
