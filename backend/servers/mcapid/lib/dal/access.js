const r = require('../r');

function allByProject() {
    return r.table('access').run().then(function (allAccess) {
        let byProject = {};
        allAccess.forEach(function (a) {
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

module.exports = {
    allByProject: allByProject,
    adminUsers: adminUsers,
    projectAccessList
};

