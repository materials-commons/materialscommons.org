module.exports = function(r) {
    'use strict';
    let run = require('./run');
    return {
        forUser: forUser
    };

    ///////////////

    // forUser returns all the projects for a specific user. It handles
    // the case where a user is an administrator.
    function forUser(user) {
        let rql;
        if (user.isAdmin) {
            rql = r.table('projects')
                .filter(r.row('owner').ne('delete@materialscommons.org'));
        } else {
            rql = r.table('access').getAll(user.id, {index: 'user_id'})
                .eqJoin('project_id', r.table('projects'))
                .zip();
        }

        rql = addComputed(rql);

        return run(rql);
    }

    // addComputed adds additional attributes to the rql that
    // that are computed from other tables.
    function addComputed(rql) {
        rql = rql.merge(function(project) {
            return {
                users: r.table('access')
                    .getAll(project('id'), {index: 'project_id'})
                    .map(function(access) {
                        return access.merge({
                            'user': access('user_id')
                        });
                    })
                    .pluck('user', 'permissions')
                    .coerceTo('array'),
                reviews: r.table('reviews')
                    .getAll(project('id'), {index: 'project_id'})
                    .coerceTo('array'),
                notes: r.table('notes')
                    .getAll(project('id'), {index: 'project_id'})
                    .coerceTo('array'),
                events: r.table('events')
                    .getAll(project('id'), {index: 'project_id'})
                    .coerceTo('array'),
                processes: [],
                samples: [],
                drafts: []
            };
        });

        return rql;
    }
};
