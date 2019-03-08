const r = require('../r');
const run = require('./run');
const model = require('../../../shared/model');
const getSingle = require('./get-single');
const renameTopDirHelper = require('./directory-rename');
const _ = require('lodash');
const experiments = require('./experiments');
const notes = require('./notes');
const db = require('./db');

function* createProject(user, attrs) {
    let name = attrs.name;
    let owner = user.id;
    let matches = yield r.table('projects')
        .filter({name: name, owner: owner});
    if (0 < matches.length) {
        return yield getProject(matches[0].id);
    }
    let description = attrs.description ? attrs.description : '';
    let project_doc = new model.Project(name, description, owner);
    let project_result = yield r.table('projects').insert(project_doc);
    let project_id = project_result.generated_keys[0];

    let directory_doc = new model.Directory(name, owner, project_id, '');
    let directory_result = yield r.table('datadirs').insert(directory_doc);
    let directory_id = directory_result.generated_keys[0];

    let proj2datadir_doc = new model.Project2DataDir(project_id, directory_id);
    yield r.table('project2datadir').insert(proj2datadir_doc);

    yield buildDefaultShortcutDirs(name, project_id, owner, directory_id);

    let access_doc = new model.Access(name, project_id, owner);
    yield r.table('access').insert(access_doc);

    return yield getProject(project_id);
}

function* buildDefaultShortcutDirs(projectName, projectId, owner, parentDirId) {
    let dir = new model.Directory(`${projectName}/Literature`, owner, projectId, parentDirId);
    dir.shortcut = true;
    yield createShortcutDir(dir);

    dir = new model.Directory(`${projectName}/Presentations`, owner, projectId, parentDirId);
    dir.shortcut = true;
    yield createShortcutDir(dir);

    dir = new model.Directory(`${projectName}/Project Documents`, owner, projectId, parentDirId);
    dir.shortcut = true;
    yield createShortcutDir(dir);
}

function* createShortcutDir(dir) {
    let created = yield db.insert('datadirs', dir);
    let proj2dir = new model.Project2DataDir(dir.project, created.id);
    yield db.insert('project2datadir', proj2dir);
}

function* getProject(projectId) {
    let rql = r.table('projects').get(projectId)
        .merge(function(project) {
            return {
                owner_details: r.table('users').get(project('owner')).pluck('fullname')
            };
        });
    rql = transformDates(rql);
    rql = addComputed(rql, true);
    let project = yield run(rql);
    return {val: project};
}

// all returns all the projects in the database. It only returns the
// project entries in the projects table. It doesn't attempt to
// build all the related entries.
function all() {
    let rql = r.table('projects').filter(r.row('owner').ne('delete@materialscommons.org'));
    return run(rql);
}

function* forUserSimple(user) {
    let rql = r.table('access').getAll(user.id, {index: 'user_id'})
        .eqJoin('project_id', r.table('projects')).zip()
        .merge((project) => ({
            owner_details: r.table('users').get(project('owner')).pluck('fullname')
        }));
    rql = transformDates(rql);
    rql = addCounts(rql);
    return yield run(rql);
}

function addCounts(rql) {
    rql = rql.merge(function(project) {
        return {
            users: r.table('access')
                .getAll(project('id'), {index: 'project_id'})
                .map(function(entry) {
                    return entry.merge({
                        'user': entry('user_id'),
                        'details': r.table('users').get(entry('user_id')).pluck('fullname')
                    });
                })
                .pluck('user', 'permissions', 'details')
                .coerceTo('array'),
            experiments_count: r.table('project2experiment').getAll(project('id'), {index: 'project_id'}).count(),
            processes_count: r.table('project2process').getAll(project('id'), {index: 'project_id'}).count(),
            samples_count: r.table('project2sample').getAll(project('id'), {index: 'project_id'}).count(),
            files_count: r.table('project2datafile').getAll(project('id'), {index: 'project_id'}).count()
        };
    });
    return rql;
}

// forUser returns all the projects for a specific user. It handles
// the case where a user is an administrator.
function* forUser(user) {
    let userProjectsRql = r.table('projects').getAll(user.id, {index: 'owner'})
        .merge(function(project) {
            return {
                owner_details: r.table('users').get(project('owner')).pluck('fullname')
            };
        });
    userProjectsRql = transformDates(userProjectsRql);
    userProjectsRql = addComputed(userProjectsRql, false);

    let memberOfRql = r.table('access').getAll(user.id, {index: 'user_id'})
        .eqJoin('project_id', r.table('projects')).zip().filter(r.row('owner').ne(user.id))
        .merge((project) => ({
            owner_details: r.table('users').get(project('owner')).pluck('fullname')
        }));

    memberOfRql = transformDates(memberOfRql);
    memberOfRql = addComputed(memberOfRql, false);

    let usersProjects = yield run(userProjectsRql);
    let memberProjects = yield run(memberOfRql);
    return usersProjects.concat(memberProjects);
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
function addComputed(rql, fullExperiment) {
    rql = rql.merge(function(project) {
        return {
            users: r.table('access').getAll(project('id'), {index: 'project_id'})
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
                }).zip().coerceTo('array'),
            notes: notes.getAllNotesForItemRQL(project('id')).coerceTo('array'),
            experiments: fullExperiment ? experiments.addExperimentComputed(r.table('project2experiment').getAll(project('id'), {index: 'project_id'})
                    .eqJoin('experiment_id', r.table('experiments')).zip()).coerceTo('array') :
                r.table('project2experiment').getAll(project('id'), {index: 'project_id'})
                    .eqJoin('experiment_id', r.table('experiments')).zip().coerceTo('array'),
            processes: r.table('project2process').getAll(project('id'), {index: 'project_id'})
                .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
            samples: r.table('project2sample').getAll(project('id'), {index: 'project_id'})
                .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
            files: r.table('project2datafile').getAll(project('id'), {index: 'project_id'}).count(),
            shortcuts: r.table('datadirs')
                .getAll([project('id'), true], {index: 'datadir_project_shortcut'})
                .coerceTo('array'),
        };
    });

    return rql;
}

function* update(projectID, attrs) {
    const pattrs = {};
    let oldName = '';

    if (attrs.name) {
        pattrs.name = attrs.name;
        let projectData = yield r.table('projects').get(projectID);
        oldName = projectData.name;
    }

    if (attrs.description) {
        pattrs.description = attrs.description;
    }

    if (attrs.overview) {
        pattrs.overview = attrs.overview;
    }

    if (attrs.reminders) {
        pattrs.reminders = attrs.reminders;
    }

    if (attrs.status) {
        pattrs.status = attrs.status;
    }

    if (attrs.todos) {
        pattrs.todos = attrs.todos;
    }

    if (pattrs.name || pattrs.description || pattrs.overview || pattrs.reminders || pattrs.status || pattrs.todos) {
        yield r.table('projects').get(projectID).update(pattrs);
    }

    if (attrs.process_templates) {
        let addTemplates = attrs.process_templates.filter(p => p.command === 'add').map(p => p.template);
        let deleteTemplates = attrs.process_templates.filter(p => p.command === 'delete').map(p => p.template);
        let updateTemplates = attrs.process_templates.filter(p => p.command === 'update').map(p => p.template);
        let project = yield r.table('projects').get(projectID);
        if (!project.process_templates) {
            project.process_templates = [];
        }
        // remove deleted templates
        project.process_templates = project.process_templates.filter(p => _.findIndex(deleteTemplates, t => t.name === p.name, null) === -1);

        // remove templates to update. They will be added back with their new values in
        // the add step.
        project.process_templates = project.process_templates.filter(p => _.findIndex(updateTemplates, t => t.name === p.name, null) === -1);

        // add new templates if they don't exist
        let toAdd = differenceByField(addTemplates, project.process_templates, 'name');
        yield r.table('projects').get(projectID).update({
            process_templates: project.process_templates.concat(toAdd).concat(updateTemplates)
        });
    }

    if (attrs.name) {
        yield renameTopDirectory(projectID, oldName, attrs.name);
    }

    return yield r.table('projects').get(projectID);
}

function* getExcelFilePaths(projectID) {
    let fileList = yield r.table('project2datafile')
        .getAll(projectID, {index: 'project_id'})
        .eqJoin([r.row('datafile_id'), 'Spreadsheet'],
            r.table('datafiles'), {index: 'id_mediatype_description'}).zip().filter({current: true})
        .merge(function(df) {
            return {
                dir: r.table('datadir2datafile').getAll(df('id'), {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.db('materialscommons').table('datadirs'))
                    .zip().coerceTo('array')
            };
        });
    let pathList = [];
    for (let i = 0; i < fileList.length; i++) {
        let path = fileList[i].dir[0].name;
        // remove project name from path (Project1/allInOne -> /allInOne)
        let index = path.indexOf('/');
        if (index === -1) {
            path = '';
        } else {
            path = path.slice(path.indexOf('/'));
        }
        fileList[i].dir = path;
        // add file name to path
        path = path + '/' + fileList[i].name;
        pathList.push({path: path, id: fileList[i].id});
    }
    return pathList;
}

function* renameTopDirectory(projectID, oldName, newName) {
    let dirsList = yield r.table('project2datadir').getAll(projectID, {index: 'project_id'})
        .eqJoin('datadir_id', r.table('datadirs')).zip()
        .filter({'name': oldName}).coerceTo('array');
    if (dirsList.length !== 1) {
        if (dirsList.length > 1) {
            throw new ReferenceError('Multiple top level directories for project, ' + projectID);
        } else {
            throw new ReferenceError('Missing top level directory for project, ' + projectID);
        }
    }
    let directoryID = dirsList[0].id;
    yield renameTopDirHelper.renameDirectory(directoryID, newName);
}

function differenceByField(from, others, field) {
    let elementsFrom = from.map(function(entry) {
        return entry[field];
    });

    let elementsOthers = others.map(function(entry) {
        return entry[field];
    });

    let diff = _.difference(elementsFrom, elementsOthers);

    return from.filter(function(entry) {
        return _.findIndex(diff, function(e) {
            return e === entry[field];
        }) !== -1;
    });
}

function* addFileToProject(projectID, fileID) {
    let link = new model.Project2DataFile(projectID, fileID);
    yield r.table('project2datafile').insert(link);
}

function* getUserAccessForProject(projectId) {
    let results = yield r.table('access').getAll(projectId, {index: 'project_id'}).pluck('user_id');
    return {val: results};
}

function* updateUserAccessForProject(projectId, attrs) {
    let results = {error: 'Bad action request - updateUserAccessForProject - ' + attrs.action};
    if (attrs.action === 'add') {
        let user_id = attrs.user_id;
        let exists = yield r.table('users').get(user_id);
        if (!exists) {
            results = {error: 'Bad request for add - updateUserAccessForProject - invalid: ' + user_id};
        } else {
            let duplicate = yield r.table('access').getAll(projectId, {index: 'project_id'})
                .filter({user_id: user_id});
            if (duplicate.length === 0) {
                let name_entry = yield r.table('projects').get(projectId).pluck('name');
                let access_doc = new model.Access(name_entry['name'], projectId, user_id);
                yield r.table('access').insert(access_doc);
            }
            results = {val: user_id};
        }
    }
    if (attrs.action === 'delete') {
        let user_id = attrs.user_id;
        let hit = yield r.table('access').getAll(projectId, {index: 'project_id'})
            .filter({user_id: user_id});
        if (hit.length !== 0) {
            yield r.table('access').get(hit[0].id).delete();
        }
        results = {val: user_id};
    }
    return results;
}

module.exports = {
    all,
    createProject,
    forUser,
    forUserSimple,
    get: function(id, index) {
        return getSingle(r, 'projects', id, index);
    },
    getExcelFilePaths,
    addFileToProject,
    getProject,
    update,
    getUserAccessForProject,
    updateUserAccessForProject
};
