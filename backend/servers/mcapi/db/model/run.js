module.exports = function(rql) {
    'use strict';
    let runopts = {
        timeFormat: 'raw'
    };
    return rql.run(runopts);
};
