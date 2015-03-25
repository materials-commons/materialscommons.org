var app = require('../app');
var status = require('http-status');
var request = require('supertest').agent(app.listen());

describe('apikey', function() {
    it('should give a 401 when a no apikey is specified', function(done) {
        request.get('/projects').expect(status.UNAUTHORIZED, done);
    });

    it('should give a 401 when a bad apikey is specified', function(done) {
        request.get('/projects?apikey=123').expect(status.UNAUTHORIZED, done);
    });
});
