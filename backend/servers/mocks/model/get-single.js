module.exports = function getSingle(what, id, index) {
    'use strict';

    let key = index ? index : 'id';

    for (let i = 0; i < what.length; i++) {
        if (what[i][key] === id) {
            return what[i];
        }
    }
    return null;

};
