/* jshint expr: true */

var model = require('../mocks/model');
var keyCache = require('../apikey-cache')(model.users);
var should = require('should');
var atf = require('./atf');

describe('apikey-cache', function() {
    'use strict';

    describe('#find', function() {
        it('should handle users without an admin flag', function(done) {
            atf(function* testAdminFlag() {
                let user2 = yield keyCache.find('user2key');
                user2.isAdmin.should.be.False;
            }, done);
        });

        it('should return undefined for unknown key', function(done) {
            atf(function* testUnknownKey() {
                let unknown = yield keyCache.find('no-such-key');
                should.not.exist(unknown);
            }, done);
        });

        it('should find known user', function(done) {
            atf(function* testKnownUser() {
                let admin = yield keyCache.find('adminkey');
                should.exist(admin);
                admin.isAdmin.should.be.True;
            }, done);
        });
    });
});
