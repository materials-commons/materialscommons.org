const _ = require('lodash');

function validString(param, len) {
    if (!_.isString(param)) {
        return false;
    }

    if (len && _.size(param) < len) {
        return false;
    }

    return true;
}


module.exports = {
    validString,
};