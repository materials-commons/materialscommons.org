// apikey cache caches the user apikeys for quick lookup.
// It preloads all the users the first time it is called
const _ = require('lodash');

class APIKeyCache {
    constructor(users) {
        this.users = users;
        this.cache = {};
    }

    setGetUsers(f) {
        this.getUsers = f;
    }

    async find(apikey) {
        if (!_.isEmpty(this.cache)) {
            return this.cache[apikey];
        }

        let allUsers = await this.users.getUsers();
        this.cache = this._users2map(allUsers);
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

let apiKeyCache = null;

module.exports = function(users) {
    if (!apiKeyCache) {
        apiKeyCache = new APIKeyCache(users);
    }

    return apiKeyCache;
};