var promise = require('bluebird');
var releases = require('./data').releases;

module.exports.getReleases = function() {
    return promise.resolve().then(function() {
        return releases;
    })
};
