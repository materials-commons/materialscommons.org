var promise = require('bluebird');
var getSingle = require('./get-single');

module.exports = {
    getUsers: getUsers,
    get: get
};

var users = [
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

function getUsers() {
    return promise.resolve().then(function() {
        return users;
    });
}

function get(id, index) {
    return promise.resolve().then(function() {
        return getSingle(users, id, index);
    });
}
