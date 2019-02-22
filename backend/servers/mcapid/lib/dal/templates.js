const _ = require('lodash');

module.exports = function(r) {
    async function getAllTemplates() {
        return r.table('templates');
    }

    return {
        getAllTemplates,
    };
};
