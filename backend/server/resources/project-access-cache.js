module.exports = function(access) {
    'use strict';

    let _ = require('lodash');
    let projectAccessCache = {};
    let adminUsersCache = {};
    return {
        find: find,
        clear: clear,
        validateAccess: validateAccess
    };

    // find looks up a given project in the project cache.
    // If the projectAccessCache hasn't been loaded it loads the
    // cache.
    function *find(project_id) {
        if (_.isEmpty(adminUsersCache)) {
            let adminUsers = yield access.adminUsers();
            adminUsers.forEach(function(user) {
                adminUsersCache[user.id] = user;
            });
        }

        if (! _.isEmpty(projectAccessCache)) {
            return projectAccessCache[project_id];
        }

        projectAccessCache = yield access.allByProject();
        return projectAccessCache[project_id];
    }

    // clear will clear the current project cache. This is useful
    // when project permissions have been updated or a new project
    // has been created.
    function clear() {
        projectAccessCache = {};
    }

    // validateAccess checks if the user has access to the
    // given project. This method assumes that find was called
    // first so that the projectAccessCache was preloaded. If the
    // projectAccessCache is empty then it returns false (no access).
    function validateAccess(project_id, user) {
        if (user.id in adminUsersCache) {
            return true;
        }

        if (_.isEmpty(projectAccessCache)) {
            return false;
        }

        if (!(project_id in projectAccessCache)) {
            return false;
        }
        let index = _.indexOf(projectAccessCache[project_id], function(a) {
            return a.user_id == user.id;
        });

        // when index !== -1 we found the given user in the project.
        return index !== -1;
    }
};
