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

    // mustNotExistInProject ensures that the item doesn't exist in
    // the project.
    function mustNotExistInProject(what, spec, done) {
        let pieces = spec.split(':'),
            modelName = pieces[0],
            index = pieces[1];
        model[modelName].findInProject(this.project_id, index, what).then(function(matches) {
            let error = matches.length === 0 ? null : {
                rule: 'mustNotExistInProject',
                actual: 'what',
                expected: `${index}:${what} should not exist in project ${this.project_id}`
            };
            done(error);
        });
    }

    // isValidPropertyType checks the different known types for a property.
    function isValidPropertyType(what, _ignore) {
        let invalid = {
            rule: 'isValidPropertyType',
            actual: what,
            expected: `type to be one of ${propertyTypes}`
        };
        return _.indexOf(propertyTypes, what) === -1 ? invalid : null;
    }

    // isValidUnit checks the different known types for unit.
    function isValidUnit(what, _ignore) {
        let invalid = {
            rule: 'isValidUnit',
            actual: what,
            expected: `units to be one of ${propertyUnits}`
        };
        return _.indexOf(propertyUnits, what) === -1 ? invalid : null;
    }
};
