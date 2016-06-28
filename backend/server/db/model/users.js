module.exports = function (r) {
    const _ = require('lodash');
    const getSingle = require('./get-single');

    return {
        getUsers: getUsers,
        getUser: getUser,
        get: function (id, index) {
            return getSingle(r, 'users', id, index);
        },
        updateProjectFavorites,
        updateUserSettings,
        userHasProjectAccess
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

    function* updateProjectFavorites(userID, projectID, attrs) {
        if (attrs.favorites) {
            // TODO: validate the projectID exists
            let user = yield r.table('users').get(userID);
            if (!user.favorites) {
                user.favorites = {};
            }

            if (!(projectID in user.favorites)) {
                user.favorites[projectID] = {
                    processes: []
                };
            }

            let toAdd = attrs.favorites.processes.
                filter(p => p.command === 'add').map(p => p.name);
            let toDelete = attrs.favorites.processes.
                filter(p => p.command === 'delete').map(p => p.name);
            let projProcesses = user.favorites[projectID].processes;
            // remove deleted process favorites
            projProcesses = projProcesses.filter(p => _.indexOf(toDelete, name => name == p, null) === -1);
            let toAddFavs = _.difference(toAdd, projProcesses);
            user.favorites[projectID].processes = projProcesses.concat(toAddFavs);
            yield r.table('users').get(userID).update({favorites: user.favorites});
        }
        return yield r.table('users').get(userID).without('admin', 'apikey', 'password');
    }

    function* updateUserSettings(userId, settings) {
        yield r.table('users').get(userId).update(settings);
        let user = yield r.table('users').get(userID).without('admin', 'apikey', 'password');
        return {val: user};
    }

    function* userHasProjectAccess(userId, projectId) {
        let accessEntries = yield r.table('access').getAll([userId, projectId], {index: 'user_project'});
        return accessEntries.length !== 0;
    }
};
