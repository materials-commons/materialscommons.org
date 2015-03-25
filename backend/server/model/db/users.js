module.exports = function(r) {
    'use strict';
    return {
        getUsers: getUsers,
        getUser: getUser
    };

    ///////////

    // getUsers returns all the users in the database.
    function getUsers() {
        return r.table('users').run();
    }

    // getUser gets the user by index. If no index is given then it
    // uses the primary key.
    function* getUser(id, index) {
        if (index) {
            let matches = yield r.table('users').getAll(id, {index: index}).run();
            if (matches.length !== 0) {
                return matches[0];
            }
            return null;
        }
        let user = yield r.table('users').get(id).run();
        return user;
    }
};
