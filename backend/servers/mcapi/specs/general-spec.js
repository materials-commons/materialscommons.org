// this file contains a few general specs for global testing of testing

var assert = require('assert');

describe('General specs - top level', function(){
    describe('First general spec', function() {
       it('should suceed', function() {
           assert.equal(0,0, "zero is zero");
       });
    });

});