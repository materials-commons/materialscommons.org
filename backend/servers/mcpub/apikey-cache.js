'use strict';
// apikey cache caches the user apikeys for quick lookup.
// It preloads all the users the first time it is called
const _ = require('lodash');
var r = require('./dash');

class APIKeyCache {
    constructor() {
        this.cache = {};
    }

    *find(apikey) {
        if (!_.isEmpty(this.cache)) {
            return this.cache[apikey];
        }

        let users = yield r.db('materialscommons').table('users').run();
        this.cache = this._users2map(users);
        return this.cache[apikey];
    }

    clear() {
        this.cache = {};
    }

    _users2map(users) {
        let map = {};
        users.forEach(function(user) {
            map[user.apikey] = {
                id: user.id,
                apikey: user.apikey,
                isAdmin: !!user.admin
            };
        });
        return map;
    }
}

let apikeyCache = null;

module.exports = function() {
    if (!apikeyCache) {
        apikeyCache = new APIKeyCache();
    }

    return apikeyCache;
};
