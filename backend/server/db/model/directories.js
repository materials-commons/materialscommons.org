module.exports = function(r) {
    const path = require('path');
    const run = require('./run');

    return {
        get: get,
        create: create
    };

    /////////////////////////////

    function* get(projectID, directoryID) {
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
        return run(rql).then(results => toDir(results[0]));
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
        return run(rql).then(results => toDir(results[0]));
    }

    function toDir(results) {
        let dir = {
            _type: 'directory',
            id: results.datadir_id,
            size: 0,
            name: path.basename(results.name),
            children: []
        };

        dir.children = results.files.map(f => {
            return {
                _type: 'file',
                size: f.size,
                name: f.name,
                mediatype: f.mediatype,
                id: f.id
            };
        });

        let childrenDirs = results.directories.map(d => {
            return {
                _type: 'directory',
                id: d.id,
                size: 0,
                name: path.basename(d.name)
            };
        });

        dir.children = dir.children.concat(childrenDirs);

        return dir;
    }

    function* create(projectID, dirArgs) {
        return [];
    }
};