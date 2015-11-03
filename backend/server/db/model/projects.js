module.exports = function (r) {
    'use strict';
    const run = require('./run');
    const getSingle = require('./get-single');
    const path = require('path');
    const _ = require('lodash');

    return {
        all: all,
        forUser: forUser,
        dirTree: dirTree,
        get: function (id, index) {
            return getSingle(r, 'projects', id, index);
        },
        update: update,
        r: r
    };

    ///////////////


    // all returns all the projects in the database. It only returns the
    // project entries in the projects table. It doesn't attempt to
    // build all the related entries.
    function all() {
        let rql = r.table('projects').filter(r.row('owner').ne('delete@materialscommons.org'));
        return run(rql);
    }

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

        rql = transformDates(rql);
        rql = addComputed(rql);

        return run(rql);
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
                users: r.table('access')
                    .getAll(project('id'), {index: 'project_id'})
                    .map(function (entry) {
                        return entry.merge({
                            'user': entry('user_id')
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

    // dirTree retrieves the files and directories for the given directory.
    // If no directory id is supplied then it gets the top level directory
    // for the project.
    function dirTree(projectID, directoryID) {
        if (directoryID == "top") {
            return topLevelDir(projectID);
        } else {
            return directoryByID(directoryID);
        }
    }

    function topLevelDir(projectID) {
        let rql = r.table('projects').getAll(projectID).
            eqJoin('name', r.table('datadirs'), {index: 'name'}).zip().
            eqJoin('id', r.table('project2datadir'), {index: 'datadir_id'}).zip().
            filter({'project_id': projectID}).
            merge(function (ddir) {
                return {
                    'files': r.table('datadir2datafile').
                        getAll(ddir('datadir_id'), {index: 'datadir_id'}).
                        eqJoin('datafile_id', r.table('datafiles')).
                        zip().
                        coerceTo('array'),
                    'directories': r.table('datadirs').getAll(ddir('datadir_id'), {index: 'parent'}).coerceTo('array')
                }
            });
        return run(rql).then(results => toTree(results[0]));
    }

    function directoryByID(directoryID) {
        let rql = r.table('project2datadir').getAll(directoryID, {index: 'datadir_id'}).
            eqJoin('datadir_id', r.table('datadirs')).
            zip().
            merge(function (ddir) {
                return {
                    'files': r.table('datadir2datafile').
                        getAll(ddir('datadir_id'), {index: 'datadir_id'}).
                        eqJoin('datafile_id', r.table('datafiles')).
                        zip().
                        coerceTo('array'),
                    'directories': r.table('datadirs').getAll(ddir('datadir_id'), {index: 'parent'}).coerceTo('array')
                }
            });
        return run(rql).then(results => toTree(results[0]));
    }

    function toTree(results) {
        let dir = {
            _type: 'directory',
            id: results.datadir_id,
            size: 0,
            name: path.basename(results.name),
            children: []
        };

        results.files.forEach(function (file) {
            let fentry = {
                _type: 'file',
                size: file.size,
                name: file.name,
                mediatype: file.mediatype,
                id: file.id
            };
            dir.children.push(fentry);
        });

        results.directories.forEach(function (d) {
            let dentry = {
                _type: 'directory',
                id: d.id,
                size: 0,
                name: path.basename(d.name)
            };
            dir.children.push(dentry);
        });
        return dir;
    }

    function* update(projectID, attrs) {
        var pattrs = {};
        if (attrs.name) {
            pattrs.name = attrs.name;
        }
        if (attrs.description) {
            pattrs.description = attrs.description;
        }

        if (pattrs.name || pattrs.description) {
            yield r.table('projects').get(projectID).update(pattrs);
        }

        if (attrs.process_templates) {
            var addTemplates = attrs.process_templates.filter(p => p.command == 'add').map(p => p.template);
            var deleteTemplates = attrs.process_templates.filter(p => p.command === 'delete').map(p => p.template);
            var updateTemplates = attrs.process_templates.filter(p => p.command === 'update').map(p => p.template);
            var project = yield r.table('projects').get(projectID);
            if (!project.process_templates) {
                project.process_templates = [];
            }
            // remove deleted templates
            project.process_templates = project.process_templates.
                filter(p => _.indexOf(deleteTemplates, t => t.name === p.name, null) === -1);

            // remove templates to update. They will be added back with their new values in
            // the add step.
            project.process_templates = project.process_templates.
                filter(p => _.indexOf(updateTemplates, t => t.name === p.name, null) === -1);

            // add new templates if they don't exist
            var toAdd = differenceByField(addTemplates, project.process_templates, 'name');
            yield r.table('projects').get(projectID).update({
                process_templates: project.process_templates.concat(toAdd).concat(updateTemplates)
            });
        }

        return yield r.table('projects').get(projectID);
    }

    function differenceByField(from, others, field) {
        var elementsFrom = from.map(function(entry) {
            return entry[field];
        });

        var elementsOthers = others.map(function(entry) {
            return entry[field];
        });

        var diff = _.difference(elementsFrom, elementsOthers);

        return from.filter(function(entry) {
            return _.indexOf(diff, function(e) {
                    return e === entry[field];
                }) !== -1;
        });
    }
};
