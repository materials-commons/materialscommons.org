// apikey cache caches the user apikeys for quick lookup.
// It preloads all the users the first time it is call.ed
var _ = require('lodash');
module.exports = function(model) {
    'use strict';
    let keycache = {};
    return {
        find: find
    };

    ////////////////////

    // find looks up an apikey in the cache. If the cache
    // is empty is loads it.
    function* find(apikey) {
        if (! _.isEmpty(keycache)) {
            return keycache[apikey];
        }

        keycache = yield loadCache();
        return keycache[apikey];
    }

    //
    function* loadCache() {
        let users = yield model.getUsers();
        return users2map(users);
    }

    // users2map converts the array of users into a map
    // indexed by apikey.
    function users2map(users) {
        let map = {};
        users.forEach(function(user) {
            map[user.apikey] = {
                id: user.id,
                apikey: user.apikey,
                isadmin: !!user.admin
            };
        });
        return map;
    }
};
