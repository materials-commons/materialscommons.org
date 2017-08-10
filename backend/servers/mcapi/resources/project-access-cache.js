const _ = require('lodash');

class ProjectAccessCache {
    constructor(access) {
        this.access = access;
        this.projectAccessCache = {};
        this.adminUsersCache = {};
    }

    *find(project_id) {
        if (_.isEmpty(this.adminUsersCache)) {
            let adminUsers = yield this.access.adminUsers();
            let self = this;
            adminUsers.forEach(function(user) {
                self.adminUsersCache[user.id] = user;
            });
        }

        if (!_.isEmpty(this.projectAccessCache)) {
            return this.projectAccessCache[project_id];
        }

        this.projectAccessCache = yield this.access.allByProject();
        return this.projectAccessCache[project_id];
    }

    clear() {
        this.projectAccessCache = {};
        this.adminUsersCache = {};
    }

    validateAccess(project_id, user) {
        if (user.id in this.adminUsersCache) {
            return true;
        }

        if (_.isEmpty(this.projectAccessCache)) {
            return false;
        }

        if (!(project_id in this.projectAccessCache)) {
            return false;
        }

        let index = _.findIndex(this.projectAccessCache[project_id], function(a) {
            return a.user_id == user.id;
        });

        // when index !== -1 we found the given user in the project.
        return index !== -1;
    }
}

let accessCache = null;
module.exports = function(access) {
    if (!accessCache) {
        accessCache = new ProjectAccessCache(access);
    }

    return accessCache;
};
