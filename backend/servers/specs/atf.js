var co = require('co');

module.exports = function atf(gen, done) {
    'use strict';

    let success = function(){ done(); };
    let fail = function(err) { done(err); };
    co(gen).then(success, fail);
};
