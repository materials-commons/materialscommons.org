const r = require('../../../shared/r');
const run = require('./run');

async function getProject(projectId) {
    let rql = r.table('projects').get(projectId)
        .merge(function (project) {
            return {
                owner_details: r.table('users').get(project('owner')).pluck('fullname')
            }
        });
    rql = transformDates(rql);
    rql = addComputed(rql);
    return await run(rql);
}


// transformDates removes the rethinkdb specific date
// fields
function transformDates(rql) {
    rql = rql.merge(function (project) {
        return {
            mtime: project('mtime').toEpochTime(),
            birthtime: project('birthtime').toEpochTime()
        };
    });
    return rql;
}

// addComputed adds additional attributes to the rql that
// that are computed from other tables.
function addComputed(rql) {
    rql = rql.merge(function (project) {
        return {
            users: transformDates(r.table('access').getAll(project('id'), {index: 'project_id'})
                .eqJoin('user_id', r.table('users')).without({
                    'right': {
                        id: true,
                        apikey: true,
                        admin: true,
                        tadmin: true,
                        demo_installed: true,
                        notes: true,
                        affiliation: true,
                        avatar: true,
                        birthtime: true,
                        description: true,
                        email: true,
                        homepage: true,
                        last_login: true,
                        mtime: true,
                        name: true,
                        password: true,
                        preferences: true,
                        otype: true
                    }
                }).zip()).coerceTo('array'),
            experiments: transformDates(r.table('project2experiment').getAll(project('id'), {index: 'project_id'})
                .eqJoin('experiment_id', r.table('experiments')).zip()).coerceTo('array'),
            processes: transformDates(r.table('project2process').getAll(project('id'), {index: 'project_id'})
                .eqJoin('process_id', r.table('processes')).zip()).coerceTo('array'),
            samples: transformDates(r.table('project2sample').getAll(project('id'), {index: 'project_id'})
                .eqJoin('sample_id', r.table('samples')).zip()).coerceTo('array'),
            files_count: r.table('project2datafile').getAll(project('id'), {index: 'project_id'}).count(),
            relationships: {
                process2sample: r.table('project2process').getAll(project('id'), {index: 'project_id'})
                    .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'}).zip()
                    .pluck('sample_id', 'property_set_id', 'process_id').coerceTo('array'),
                experiment2sample: r.table('project2experiment').getAll(project('id'), {index: 'project_id'})
                    .eqJoin('experiment_id', r.table('experiment2sample'), {index: 'experiment_id'}).zip()
                    .pluck('experiment_id', 'sample_id').coerceTo('array')
            }
        };
    });

    return rql;
}



module.exports = {
    getProject,
};
