module.exports = function() {
    const _ = require('lodash');
    var r = require('./dash');
    return {
        getUsers: getUsers
    };


    // getUsers returns all the users in the database.
    function getUsers() {
        return r.table('users').run();
    }

};
