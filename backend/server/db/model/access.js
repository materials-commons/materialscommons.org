module.exports = function(r) {
    'use strict';

    return {
        allByProject: allByProject,
        adminUsers: adminUsers,
    };

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

    function adminUsers() {
        return r.table('users').filter({admin: true}).run();
    }
};
