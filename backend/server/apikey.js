var http = require('http');
module.exports = function(rethink) {
    'use strict';
    let r = rethink;
    let users = [];
    return function*(next) {
        users = yield getUsers();
        let apikey = this.query.apikey || this.throw(401, 'Invalid apikey');
        let user = users[apikey] || this.throw(401, 'Invalid apikey');
        this.mcapp = {
            user: {
                id: user.id,
                apikey: apikey,
                isadmin: !!user.admin
            }
        };
        yield next;
    };

    function* getUsers() {
        if (users.length !== 0) {
            return users;
        }
        let allUsers = yield r.table('users').pluck('id', 'apikey', 'admin').run();
        let usersMap = {};
        allUsers.forEach(function(user) {
            usersMap[user.apikey] = user;
        });
        return usersMap;
    }
};
