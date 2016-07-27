// apikey module validates the apikey argument used in the call. It
// caches the list of users to make lookups faster.
module.exports = function(users) {
    'use strict';
    let apikeyCache = require('./apikey-cache')(users);
    let httpStatus = require('http-status');
    let _ = require('lodash');

    // whiteList contains paths that don't require
    // a valid apikey.
    let whiteList = {
        "/login": true,
        "/accounts": true,
        "/users/validate/": true
    };
    // validateAPIKey Looks up the apikey. If none is specified, or a
    // bad key is passed then abort the calls and send back an 401.
    return function *validateAPIKey(next) {
        if (!(matchPathInWhiteList(this.path))) {
            let UNAUTHORIZED = httpStatus.UNAUTHORIZED;
            let apikey = this.query.apikey || this.throw(UNAUTHORIZED, 'Not authorized');
            let user = yield apikeyCache.find(apikey);
            if (! user) {
                this.throw(UNAUTHORIZED, 'Not authorized');
            }
            this.reqctx = {
                user: user
            };
        }
        yield next;
    };

    function matchPathInWhiteList(path) {
        if (path in whiteList) {
            return true;
        } else {
            let keys = _.keys(whiteList);
            for (let key of keys) {
                if (path.startsWith(key)) {
                    return true;
                }
            }
        }
        return false;
    }
};
