module.exports = function(r) {
    const _ = require('lodash');
    const getSingle = require('./get-single');

    return {
        getUsers: getUsers,
        getUser: getUser,
        get: function(id, index) {
            return getSingle(r, 'users', id, index);
        },
        update: update
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
        return yield r.table('users').get(id).run();
    }

    function* update(userID, attrs) {
        if (attrs.favorites) {
            // TODO: validate the projectID exists
            let user = yield r.table('users').get(userID);
            if (!user.favorites) {
                user.favorites = {};
            }
            Object.keys(attrs.favorites).forEach(proj => {
                let toAdd = attrs.favorites[proj].processes.
                    filter(p => p.command === 'add').map(p => p.name);
                let toDelete = attrs.favorites[proj].processes.
                    filter(p => p.command === 'delete').map(p => p.name);
                if (!(proj in user.favorites)) {
                    user.favorites[proj] = {processes:[]};
                }
                let projProcesses = user.favorites[proj].processes;
                // remove deleted process favorites
                projProcesses = projProcesses.filter(p => _.indexOf(toDelete, name => name == p, null) === -1);
                let toAddFavs = _.difference(toAdd, projProcesses);
                user.favorites[proj].processes = projProcesses.concat(toAddFavs);
            });
            yield r.table('users').get(userID).update({favorites: user.favorites});
        }
        return yield r.table('users').get(userID).without('admin', 'apikey', 'password');
    }
};
