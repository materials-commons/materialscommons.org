const model = require('@lib/model');

module.exports = function(r) {

    const db = require('./db')(r);

    function allByProject() {
        return r.table('access').run().then(function(allAccess) {
            let byProject = {};
            allAccess.forEach(function(a) {
                if (!(a.project_id in byProject)) {
                    byProject[a.project_id] = [];
                }
                byProject[a.project_id].push(a);
            });
            return byProject;
        });
    }

    async function projectAccessList(projectId) {
        return await r.table('access').getAll(projectId, {index: 'project_id'});
    }

    function adminUsers() {
        return r.table('users').filter({admin: true}).run();
    }

    async function addUserToProject(userId, projectId) {
        let userEntry = await r.table('access').getAll([userId, projectId], {index: 'user_project'});
        if (userEntry.length) {
            // User already in project
            return userEntry[0]; // getAll returns an array of items (in this case of 1 item)
        }

        let accessEntry = new model.Access('', projectId, userId);
        return await db.insert('access', accessEntry);
    }

    async function removeUserFromProject(userId, projectId) {
        let rv = await r.table('access').getAll([userId, projectId], {index: 'user_project'}).delete();
        return rv.deleted !== 0;
    }

    return {
        allByProject,
        adminUsers,
        projectAccessList,
        addUserToProject,
        removeUserFromProject,
    };
};

