var _ = require('lodash');
module.exports = function(model) {
    'use strict';

    let propertyTypes = [
        'number',
        'string',
        'histogram',
        'composition'
    ];

    let propertyUnits = [
        'mm',
        'm',
        'c',
        'f'
    ];

    return {
        mustExist: mustExist,
        mustNotExist: mustNotExist,
        isValidPropertyType: isValidPropertyType,
        isValidUnit: isValidUnit
    };

    // mustExist looks up an entry in the named table by id. If
    // the entry doesn't exist it returns an error.
    function mustExist(what, modelName, done) {
        model[modelName].get(what).then(function(value) {
            let error = null;
            if (!value) {
                error = {
                    rule: 'mustExist',
                    actual: what,
                    expected: 'did not find ' + what + ' in model'
                };
            }
            done(error);
        });
    }

    // mustNotExist looks up an entry in the named table by the named
    // index. If the entry exists it returns an error.
    function mustNotExist(what, spec, done) {
        let pieces = spec.split(':'),
            modelName = pieces[0],
            modelIndex = pieces[1];
        model[modelName].get(what, modelIndex).then(function(value) {
            let error = null;
            if (value) {
                // found a match, when we shouldn't have
                error = {
                    rule: 'mustNotExist',
                    actual: what,
                    expected: `found ${what} in model`
                };
            }
            done(error);
        });
    }


    function isValidPropertyType(what, _ignore) {
        let invalid = {
            rule: 'isValidPropertyType',
            actual: what,
            expected: `type to be one of ${propertyTypes}`
        };
        return _.indexOf(propertyTypes, what) === -1 ? invalid : null;
    }

    function isValidUnit(what, _ignore) {
        let invalid = {
            rule: 'isValidUnit',
            actual: what,
            expected: `units to be one of ${propertyUnits}`
        };
        return _.indexOf(propertyUnits, what) === -1 ? invalid : null;
    }
};
