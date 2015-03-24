module.exports = function(r) {
    'use strict';
    return {
        getProjectsForUser: getProjectsForUser
    };

    ///////////////

    function *getProjectsForUser(user, isAdmin) {
        let rql;
        if (isAdmin) {
            rql = r.table('projects')
                .filter(r.row('owner').ne('delete@materialscommons.org'))
                .pluck('name').orderBy('name');
        } else {
            rql = r.table('access').getAll(user, {index: 'user_id'})
                .eqJoin('project_id', r.table('projects'))
                .zip()
                .pluck('name')
                .orderBy('name');
        }

        return yield rql.run();
    }
};
