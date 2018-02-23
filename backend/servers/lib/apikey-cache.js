// apikey cache caches the user apikeys for quick lookup.
// It preloads all the users the first time it is called
const _ = require('lodash');

class APIKeyCache {
    constructor(model) {
        this.cache = {};
        this.model = model;
    }

    *find(apikey) {
        if (! _.isEmpty(this.cache)) {
            return this.cache[apikey];
        }

        let users = yield this.model.getUsers();
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
                fullname: user.fullname,
                apikey: user.apikey,
                isAdmin: !!user.admin
            };
        });
        return map;
    }
}

let apikeyCache = null;

module.exports = function(model) {
    if (! apikeyCache) {
        apikeyCache = new APIKeyCache(model);
    }

    return apikeyCache;
};
