const r = require('../../../shared/r');
const run = require('./run');
const model = require('../../../shared/model');
const db = require('./db');

async function createProject(user, name, description) {
    let owner = user.id;
    let matches = await r.table('projects').filter({name: name, owner: owner});
    if (0 < matches.length) {
        return await getProject(matches[0].id);
    }
    let project = new model.Project(name, description, owner);
    let result = await r.table('projects').insert(project);
    let project_id = result.generated_keys[0];

    let directory = new model.Directory(name, owner, project_id, '');
    let directoryResult = await r.table('datadirs').insert(directory);
    let directory_id = directoryResult.generated_keys[0];

    let proj2datadir_doc = new model.Project2DataDir(project_id, directory_id);
    await r.table('project2datadir').insert(proj2datadir_doc);

    await buildDefaultShortcutDirs(name, project_id, owner, directory_id);

    let access = new model.Access(name, project_id, owner);
    await r.table('access').insert(access);

    return await getProject(project_id);
}

async function buildDefaultShortcutDirs(projectName, projectId, owner, parentDirId) {
    let dir = new model.Directory(`${projectName}/Literature`, owner, projectId, parentDirId);
    dir.shortcut = true;
    await createShortcutDir(dir);

    dir = new model.Directory(`${projectName}/Presentations`, owner, projectId, parentDirId);
    dir.shortcut = true;
    await createShortcutDir(dir);

    dir = new model.Directory(`${projectName}/Project Documents`, owner, projectId, parentDirId);
    dir.shortcut = true;
    await createShortcutDir(dir);
}

async function createShortcutDir(dir) {
    let created = await db.insert('datadirs', dir);
    let proj2dir = new model.Project2DataDir(dir.project, created.id);
    await db.insert('project2datadir', proj2dir);
}

async function getProject(projectId) {
    let rql = r.table('projects').get(projectId)
        .merge(function(project) {
            return {
                owner_details: r.table('users').get(project('owner')).pluck('fullname')
            };
        });
    rql = transformDates(rql);
    rql = addComputed(rql);
    return await run(rql);
}

async function getAll() {
    let rql = r.table('projects');
    rql = transformDates(rql);
    return await run(rql);
}

async function getProjectExperiment(projectId, experimentId) {
    let rql = r.table('project2experiment').getAll([projectId, experimentId], {index: 'project_experiment'})
        .eqJoin('experiment_id', r.table('experiments')).zip()
        .merge(e => {
            return {
                mtime: e('mtime').toEpochTime(),
                birthtime: e('birthtime').toEpochTime()
            };
        })
        .merge(() => {
            return {
                processes: transformDates(r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'})
                    .eqJoin('process_id', r.table('processes')).zip())
                    .merge(process => {
                        return {
                            files_count: r.table('process2file').getAll(process('id'), {index: 'process_id'}).count(),
                            files: [],
                            filesLoaded: false
                        };
                    })
                    .coerceTo('array'),
                samples: transformDates(r.table('experiment2sample').getAll(experimentId, {index: 'experiment_id'})
                    .eqJoin('sample_id', r.table('samples')).zip()).coerceTo('array'),
                relationships: {
                    process2sample: r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'})
                        .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'}).zip()
                        .pluck('sample_id', 'property_set_id', 'process_id', 'direction').coerceTo('array')
                }
            };
        });
    return await run(rql);
}

// transformDates removes the rethinkdb specific date
// fields
function transformDates(rql) {
    rql = rql.merge(function(project) {
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
    rql = rql.merge(function(project) {
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
                    .pluck('sample_id', 'property_set_id', 'process_id', 'direction').coerceTo('array'),
                experiment2sample: r.table('project2experiment').getAll(project('id'), {index: 'project_id'})
                    .eqJoin('experiment_id', r.table('experiment2sample'), {index: 'experiment_id'}).zip()
                    .pluck('experiment_id', 'sample_id').coerceTo('array')
            }
        };
    });

    return rql;
}

async function getProjectsForUser(userId) {
    let userProjectsRql = transformDates(r.table('projects').getAll(userId, {index: 'owner'}).merge(projectDetailCounts));
    let memberProjectsRql = transformDates(r.table('access').getAll(userId, {index: 'user_id'}).eqJoin('project_id', r.table('projects'))
        .zip().filter(r.row('owner').ne(userId)).merge(projectDetailCounts));
    let userProjects = await run(userProjectsRql);
    let memberProjects = await run(memberProjectsRql);
    return userProjects.concat(memberProjects);
}

function projectDetailCounts(p) {
    return {
        shortcuts: r.table('datadirs').getAll([p('id'), true], {index: 'datadir_project_shortcut'}).pluck('name', 'id').coerceTo('array'),
        owner_details: r.table('users').get(p('owner')).pluck('fullname'),
        users_count: r.table('access').getAll(p('id'), {index: 'project_id'}).count(),
        samples_count: r.table('project2sample').getAll(p('id'), {index: 'project_id'}).count(),
        processes_count: r.table('project2process').getAll(p('id'), {index: 'project_id'}).count(),
        experiments_count: r.table('project2experiment').getAll(p('id'), {index: 'project_id'}).count(),
        datasets_count: r.table('project2dataset').getAll(p('id'), {index: 'project_id'}).count(),
        root_dir: r.table('datadirs').getAll([p('id'), p('name')]).coerceTo('array')
    };
}

async function getProjectOverview(projectId, userId) {
    let res = await projectUserRql(projectId, userId).eqJoin('project_id', r.table('projects')).zip()
        .merge(projectDetailCounts).merge(projectExperiments);
    return res[0]; // query returns a list of one entry
}

function projectExperiments(p) {
    return {
        experiments: r.table('project2experiment').getAll(p('id'), {index: 'project_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip().merge(experimentOverview).coerceTo('array')
    };
}

function experimentOverview(e) {
    return {
        owner_details: r.table('users').get(e('owner')).pluck('fullname'),
        files_count: r.table('experiment2datafile').getAll(e('id'), {index: 'experiment_id'}).count(),
        samples_count: r.table('experiment2sample').getAll(e('id'), {index: 'experiment_id'}).count(),
    };
}

async function getProjectNotes(projectId, userId) {
    return await projectUserRql(projectId, userId).eqJoin('project_id', r.table('note2item'), {index: 'item_id'}).zip()
        .eqJoin('note_id', r.table('notes')).zip();
}

function projectUserRql(projectId, userId) {
    return r.table('access').getAll([userId, projectId], {index: 'user_project'});
}

/*
res, err := r.Table("access").GetAllByIndex("project_id", id).
		EqJoin("user_id", r.Table("users")).
		Without(map[string]interface{}{"right": map[string]interface{}{"id": true}}).Zip().Run(e.Session)
 */
// async function getProjectAccessEntries(projectId) {
//     return await r.table('access').getAll(projectId, {index: 'project_id'}).eqJoin('user_id' r.table('users'))
// }

module.exports = {
    createProject,
    getProject,
    getAll,
    getProjectExperiment,
    ui: {
        getProjectsForUser,
        getProjectOverview,
        getProjectNotes,
        // getProjectAccessEntries,
    }
};
