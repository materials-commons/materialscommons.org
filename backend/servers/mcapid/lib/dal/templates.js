const r = require('../../../shared/r');
const _ = require('lodash');

async function getAllTemplates() {
    return r.table('templates');
}

module.exports = {
    getAllTemplates,
};
