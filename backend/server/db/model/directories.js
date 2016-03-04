module.exports = function (r) {
    const path = require('path');
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const getSingle = require('./get-single');

    return {
        get: get,
        create: create,
        update: update
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
                    files: r.table('datadir2datafile').
                        getAll(ddir('datadir_id'), {index: 'datadir_id'}).
                        eqJoin('datafile_id', r.table('datafiles')).
                        zip().
                        filter({current: true}).
                        coerceTo('array'),
                    directories: r.table('datadirs').getAll(ddir('datadir_id'), {index: 'parent'}).coerceTo('array')
                }
            });
        return dbExec(rql).then(results => toDir(results[0]));
    }

    function directoryByID(directoryID) {
        let rql = r.table('project2datadir').getAll(directoryID, {index: 'datadir_id'}).
            eqJoin('datadir_id', r.table('datadirs')).
            zip().
            merge(function (ddir) {
                return {
                    files: r.table('datadir2datafile').
                        getAll(ddir('datadir_id'), {index: 'datadir_id'}).
                        eqJoin('datafile_id', r.table('datafiles')).
                        zip().
                        filter({current: true}).
                        coerceTo('array'),
                    directories: r.table('datadirs').getAll(ddir('datadir_id'), {index: 'parent'}).coerceTo('array')
                }
            });
        return dbExec(rql).then(results => toDir(results[0]));
    }

    function toDir(results) {
        let dir = {
            _type: 'directory',
            id: results.datadir_id,
            size: 0,
            name: path.basename(results.name),
            path: results.name,
            checksum: "",
            children: []
        };

        dir.children = results.files.map(f => {
            return {
                _type: 'file',
                size: f.size,
                name: f.name,
                path: path.join(dir.path, f.name),
                mediatype: f.mediatype,
                checksum: f.checksum,
                id: f.id
            };
        });

        let childrenDirs = results.directories.map(d => {
            return {
                _type: 'directory',
                id: d.id,
                size: 0,
                name: path.basename(d.name),
                path: d.name,
                checksum: ""
            };
        });

        dir.children = dir.children.concat(childrenDirs);

        return dir;
    }

    // create will create a directory path. It will create all children in the path, skipping
    // any entries that exist. Starting paths can be specified in 3 different ways:
    // from_dir is an id => start creating directories starting from id
    // from_dir == '/' => start creating directories starting from project root
    // from_dir == /path/of/directories' => start creating directories from leaf (must be valid)
    function* create(projectID, projectName, dirArgs) {
        if (dirArgs.from_dir.startsWith('/')) {
            return yield createFromPath(projectID, projectName, dirArgs);
        } else {
            return yield createFromDirID(projectID, dirArgs);
        }
    }

    function* createFromDirID(projectID, dirArgs) {
        let startingDir = yield dirById(dirArgs.from_dir, projectID);
        if (!startingDir) {
            return {
                error: `directory id ${dirArgs.from_dir} not found`
            };
        }
        let created = yield createDirs(projectID, startingDir, dirSegments(dirArgs.path));
        return {
            val: created
        };
    }

    function* dirByPath(projectID, dirPath) {
        let rql = r.table('datadirs').getAll(dirPath, {index: 'name'}).
            filter({project: projectID});
        let dirs = yield dbExec(rql);
        if (dirs.length) {
            return dirs[0];
        }
        return null;
    }

    function* dirById(dirID, projectID) {
        let dir = yield getSingle(r, 'datadirs', dirID);
        if (! dir) {
            return null;
        } else if (dir.project !== projectID) {
            return null;
        }
        return dir;
    }

    function* createFromPath(projectID, projectName, dirArgs) {
        let dirPath = dirArgs.from_dir === '/' ? projectName : projectName + dirArgs.from_dir;
        let startingDir = yield dirByPath(projectID, dirPath);
        if (!startingDir) {
            return {
                error: `invalid dir path ${dirArgs.from_dir}`
            }
        }

        let created = yield createDirs(projectID, startingDir, dirSegments(dirArgs.path));
        return {
            val: created
        };
    }

    function dirSegments(from) {
        let cleaned = trimStartingSlashes(from);
        return cleaned.split('/');
    }

    function trimStartingSlashes(from) {
        while (from.charAt(0) === '/') {
            from = from.substr(1);
        }
        return from;
    }

    function* createDirs(projectID, startingDir, dirSegments) {
        let existing = true;
        let dirPath = startingDir.name;
        let dirEntry = startingDir;
        let createdDirs = [];
        for (let pathEntry of dirSegments) {
            dirPath = dirPath + '/' + pathEntry;
            if (!existing) {
                // if we encountered an unknown dir then all dirs afterward are
                // unknown and can just be created.
                dirEntry = yield insertDir(projectID, dirEntry.id, dirEntry.owner, dirPath);
                createdDirs.push(dirEntry);
            } else {
                // Check if dir exists, if it does continue checking, if not
                // create it, set dirEntry to newly created (so we have a parent),
                // and set existing to false so that all subsequent loop iterations
                // will simply create the path.
                let newDirEntry = yield dirByPath(projectID, dirPath);
                if (!newDirEntry) {
                    existing = false;
                    dirEntry = yield insertDir(projectID, dirEntry.id, dirEntry.owner, dirPath);
                    createdDirs.push(dirEntry);
                } else {
                    dirEntry = newDirEntry;
                }
            }
        }
        return createdDirs;
    }

    function* insertDir(projectID, parentID, owner, dirPath) {
        let dir = new model.Directory(dirPath, owner, projectID, parentID);
        let newDir = yield db.insert('datadirs', dir);
        let proj2dir = new model.Project2DataDir(projectID, newDir.id);
        yield db.insert('project2datadir', proj2dir);
        return newDir;
    }

    function* update(projectID, directoryID, updateArgs) {
        // Only update supported for now is moving a directory.

        // Validate that the new directory is in the project
        let findDirRql = r.table('project2datadir')
            .getAll([projectID, updateArgs.move.new_directory_id], {index: 'project_datadir'});
        let matches = yield dbExec(findDirRql);
        if (!matches.length) {
            return {error: 'Directory not in project'};
        }

        let newDir = yield dbExec(r.table('datadirs').get(updateArgs.move.new_directory_id));
        let updateDir = yield dbExec(r.table('datadirs').get(directoryID));
        let updateFields = {
            name: path.join(newDir.name, path.basename(updateDir.name)),
            parent: newDir.id
        };

        yield r.table('datadirs').get(directoryID).update(updateFields);

        let rv = {};
        rv.val = yield directoryByID(directoryID);
        return rv;
    }
};