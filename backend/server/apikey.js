// apikey module validates the apikey argument used in the call. It
// caches the list of users to make lookups faster.
var http = require('http');
var httpStatus = require('http-status');
module.exports = function(apikeyCache) {
    'use strict';
    // validateAPIKey Looks up the apikey. If none is specified, or a
    // bad key is passed then abort the calls and send back an 401.
    return function* validateAPIKey(next) {
        let UNAUTHORIZED = httpStatus.UNAUTHORIZED;
        let apikey = this.query.apikey || this.throw(UNAUTHORIZED, 'Invalid apikey');
        let user = yield apikeyCache.find(apikey);
        if (! user) {
            this.throw(UNAUTHORIZED, 'Invalid apikey');
        }
        this.mcapp = {
            user: user
        };
        yield next;
    };
};
