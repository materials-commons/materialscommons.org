module.exports = function() {
    'use strict';

    let _ = require('lodash');
    var self = {};

    // extendedFindIndex extends the lodash findIndex implementation to support
    // passing a function to check for equality.
    function extendedFindIndex(array, test) {

        // save a reference to the core implementation
        self.findIndexValue = _.findIndex;
        return findIndex;

        /////
        function findIndex(array, test) {
            // delegate to standard findIndex if the test isn't a function
            if (!_.isFunction(test)) { return self.findIndexValue(array, test); }
            // otherwise, look for the index
            for (var x = 0; x < array.length; x++) {
                if (test(array[x])) { return x; }
            }
            // not found, return fail value
            return -1;
        }
    }

    // findIndexWhen will apply the function fn to the result if
    // a match is found and return true. If no match is found
    // it will return false;
    function when(array, test, fn) {
        var index = _.findIndex(array, test);
        if (index !== -1) {
            fn(array[index]);
            return true;
        }

        return false;
    }

    // using .mixin allows both wrapped and unwrapped calls:
    // _(array).findIndex(...) and _.findIndex(array, ...)
    _.mixin({
        // return the index of the first array element passing a test
        findIndex: extendedFindIndex(),
        when: when
    });
};
