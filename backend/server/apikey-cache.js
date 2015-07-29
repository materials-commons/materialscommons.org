// apikey cache caches the user apikeys for quick lookup.
// It preloads all the users the first time it is call.ed
var _ = require('lodash');
module.exports = function(model) {
    'use strict';
    let apikeyCache = {};
    return {
        find: find,
        clear: clear
    };

    ////////////////////

    // find looks up an apikey in the cache. If the cache
    // is empty is loads it.
    function* find(apikey) {
        if (! _.isEmpty(apikeyCache)) {
            console.log('keycache not empty');
            return apikeyCache[apikey];
        }

        console.log('loading apikey cache');
        let users = yield model.getUsers();
        apikeyCache = users2map(users);
        return apikeyCache[apikey];
    }

    function clear() {
        console.log('clearing apikey cache');
        apikeyCache = {};
        console.log('after clear: ', apikeyCache);
    }

    // users2map converts the array of users into a map
    // indexed by apikey.
    function users2map(users) {
        console.log('users2map');
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
};
