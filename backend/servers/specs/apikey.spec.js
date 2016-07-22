/* jshint expr: true */

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

    it('should return data with a good apikey', function(done) {
        var isProjects = function(res) {
            res.should.be.json;
            res.body.should.be.length(2);
        };
        request.get('/projects?apikey=user1key')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(isProjects)
            .end(done);
    });
});
