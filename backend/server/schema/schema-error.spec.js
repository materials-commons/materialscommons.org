/* jshint expr: true */
var serror = require('./schema-error');

describe('serror', function() {
    'use strict';
    it('should create a valid error', function() {
        let e = serror().rule('my rule').actual('my actual').expected('my expected').done();
        e.rule.should.eql('my rule');
        e.actual.should.eql('my actual');
        e.expected.should.eql('my expected');
    });

    it('should handle passed in values', function() {
        let e = serror('rule 2').actual('actual 2').expected('expected 2').done();
        e.rule.should.eql('rule 2');
        e.actual.should.eql('actual 2');
        e.expected.should.eql('expected 2');
    });

    it('should take values from a template object', function() {
        let t = {
            rule: 'rule1',
            actual: 'actual1',
            expected: 'expected1'
        };

        let e = serror().from(t).done();
        e.rule.should.eql('rule1');
        e.actual.should.eql('actual1');
        e.expected.should.eql('expected1');

        e = serror().from({rule: 'hello'}).done();
        e.rule.should.eql('hello');
        e.actual.should.eql('');
        e.expected.should.eql('');
    });

    it('should take values from a template array', function() {
        let e = serror().from(['rule1']).done();
        e.rule.should.eql('rule1');
        e.actual.should.eql('');
        e.expected.should.eql('');
    });
});
