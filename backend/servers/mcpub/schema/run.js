'use strict';

module.exports = function(rql) {
    var runopts = {
        timeFormat: 'raw'
    };
    return rql.run(runopts);
};
