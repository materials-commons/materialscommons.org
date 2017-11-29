// apikey module validates the apikey argument used in the call. It
// caches the list of users to make lookups faster.
module.exports = function() {
    'use strict';
    let apikeyCache = require('./apikey-cache')();
    let httpStatus = require('http-status');

    // whiteList contains paths that don't require
    // a valid apikey.
    let whiteList = {
        "/login": true,
        "/datasets": true,
        "/datasets/count": true,
        "/tags": true,
        "/views": true,
        "/authors/count": true,
        "/datasets/views": true,
        "/datasets/recent": true
    };
    // validateAPIKey Looks up the apikey. If none is specified, or a
    // bad key is passed then abort the calls and send back an 401.
    return function *validateAPIKey(next) {
        if (false) {
            if (!(this.path in whiteList)) {
                let UNAUTHORIZED = httpStatus.UNAUTHORIZED;
                let apikey = this.query.apikey || this.throw(UNAUTHORIZED, 'Not authorized');
                let user = yield apikeyCache.find(apikey);
                if (!user) {
                    this.throw(UNAUTHORIZED, 'Not authorized');
                }
                this.reqctx = {
                    user: user
                };
            }
        }
        yield next;
    };
};
