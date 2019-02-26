const model = require('@lib/model');

module.exports = function(r) {
    const db = require('../db')(r);

    const createDirsFromParent = async(path, parentId, projectId) => {
        let parentDir = await getDirByIdAndProjectId(parentId, projectId);
        return await createDirs(projectId, parentDir, dirSegments(path));
    };

    const getDirByIdAndProjectId = async(dirId, projectId) => {
        return await r.table('project2datadir').getAll([projectId, dirId], {index: 'project_datadir'})
            .eqJoin('datadir_id', r.table('datadirs')).zip().nth(0);
    };

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

    const createDirs = async(projectId, startingDir, dirSegments) => {
        let existing = true;
        let dirPath = startingDir.name;
        let dirEntry = startingDir;
        let createdDirs = [];
        for (let pathEntry of dirSegments) {
            dirPath = dirPath + '/' + pathEntry;
            if (!existing) {
                // if we encountered an unknown dir then all dirs afterward are
                // unknown and can just be created.
                dirEntry = await insertDir(projectId, dirEntry.id, dirEntry.owner, dirPath);
                createdDirs.push(dirEntry);
            } else {
                // Check if dir exists, if it does continue checking, if not
                // create it, set dirEntry to newly created (so we have a parent),
                // and set existing to false so that all subsequent loop iterations
                // will simply create the path.
                let newDirEntry = await dirByPath(projectId, dirPath);
                if (!newDirEntry) {
                    existing = false;
                    dirEntry = await insertDir(projectId, dirEntry.id, dirEntry.owner, dirPath);
                    createdDirs.push(dirEntry);
                } else {
                    dirEntry = newDirEntry;
                    createdDirs.push(dirEntry);
                }
            }
        }
        return createdDirs;
    };

    const insertDir = async(projectID, parentID, owner, dirPath) => {
        let dir = new model.Directory(dirPath, owner, projectID, parentID);
        let newDir = await db.insert('datadirs', dir);
        let proj2dir = new model.Project2DataDir(projectID, newDir.id);
        await db.insert('project2datadir', proj2dir);
        return newDir;
    };

    const dirByPath = async(projectId, dirPath) => {
        let dirs = await r.table('datadirs').getAll([projectId, dirPath], {index: 'datadir_project_name'});

        if (dirs.length) {
            return dirs[0];
        }

        return null;
    };

    return {
        createDirsFromParent,
    };
};
