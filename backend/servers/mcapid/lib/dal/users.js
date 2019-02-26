const r = require('@lib/r');
const _ = require('lodash');

// getUsers returns all the users in the database. Internal use only
async function getUsers() {
    return r.table('users');
}

module.exports = {
    getUsers: getUsers,
};