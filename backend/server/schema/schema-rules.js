module.exports = function(model) {
    return {
        mustExist: mustExist,
        mustNotExist: mustNotExist
    };

    function mustExist(what, modelName, done) {
        'use strict';
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

    function mustNotExist(what, spec, done) {
        'use strict';

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
};
