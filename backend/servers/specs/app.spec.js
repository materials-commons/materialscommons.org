var mockUsers = require('../mocks/model/users');
var co = require('co');

describe('Array', function() {
    describe('#length', function() {
        it('should have length 2', function() {
            [1, 2].should.have.length(2);
        });
    });
});

describe('Users', function() {
    it('should have length 2', function(done) {
        co(function*() {
            var users2 = yield mockUsers.getUsers();
            users2.should.have.length(3);
        }).then(function() {
            done();
        }, function(err) {
            done(err);
        });
    });
});
