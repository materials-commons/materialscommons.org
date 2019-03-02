const path = require('path');

module.exports = function(r) {

    const dirUtils = require('./dir-utils')(r);

    async function getDirectoryForProject(dirId, projectId) {
        if (dirId === 'root') {
            return await getProjectRoot(projectId);
        }

        return await getDirectoryByIdForProject(dirId, projectId);
    }

    async function getProjectRoot(projectId) {
        let root = await r.table('projects').getAll(projectId)
            .eqJoin([projectId, r.row('name')], r.table('datadirs'), {index: 'datadir_project_name'}).zip()
            .merge(filesAndDirsRql).nth(0);
        return transformDir(root);
    }

    async function getDirectoryByIdForProject(dirId, projectId) {
        let dir = await r.table('project2datadir').getAll([projectId, dirId], {index: 'project_datadir'})
            .eqJoin('datadir_id', r.table('datadirs')).zip()
            .merge(filesAndDirsRql).nth(0);
        return transformDir(dir);
    }

    function filesAndDirsRql(ddir) {
        return {
            files: r.table('datadir2datafile').getAll(ddir('id'), {index: 'datadir_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip()
                .filter({current: true})
                .coerceTo('array'),
            directories: r.table('datadirs').getAll(ddir('id'), {index: 'parent'}).coerceTo('array')
        };
    }

    async function getDirectoryByPathForProject(path, projectId) {
        let dir = await r.table('datadirs').getAll([projectId, path], {index: 'datadir_project_name'})
            .merge(filesAndDirsRql).nth(0);
        return transformDir(dir);
    }

    function transformDir(directory) {
        let dir = {
            otype: 'directory',
            id: directory.id,
            size: 0,
            name: path.basename(directory.name),
            path: directory.name,
            checksum: '',
            children: [],
            shortcut: directory.shortcut,
        };

        dir.children = directory.files.map(f => {
            return {
                otype: 'file',
                size: f.size,
                name: f.name,
                path: path.join(dir.path, f.name),
                mediatype: f.mediatype,
                checksum: f.checksum,
                id: f.id,
                usesid: f.usesid,
                shortcut: false,
            };
        });

        let childrenDirs = directory.directories.map(d => {
            return {
                otype: 'directory',
                id: d.id,
                size: 0,
                name: path.basename(d.name),
                path: d.name,
                checksum: '',
                shortcut: d.shortcut
            };
        });

        dir.children = dir.children.concat(childrenDirs);

        return dir;
    }

    async function createDirectoryInProject(path, projectId, parentDirId, returnParent) {
        let dirs = await dirUtils.createDirsFromParent(path, parentDirId, projectId);
        if (returnParent) {
            return await getDirectoryForProject(parentDirId, projectId);
        }

        return dirs;
    }

    async function deleteFilesFromDirectoryInProject(files, dirId, projectId, returnParent) {
        let results = await dirUtils.deleteDirsAndFilesInDirectoryFromProject(files, dirId, projectId);
        let rv = {
            delete_results: {
                files: results.files,
                directories: results.directories,
            }
        };

        if (returnParent) {
            let parent = await getDirectoryForProject(dirId, projectId);
            parent.delete_results = rv.delete_results;
            return parent;
        }

        return rv;
    }

    async function moveDirectory(directoryId, toDirectoryId) {
        await dirUtils.moveDir(directoryId, toDirectoryId);
        return await r.table('datadirs').get(directoryId);
    }

    async function renameDirectory(directoryId, newName) {
        await dirUtils.renameDir(directoryId, newName);
        return await r.table('datadirs').get(directoryId);
    }

    return {
        getDirectoryForProject,
        getDirectoryByPathForProject,
        createDirectoryInProject,
        deleteFilesFromDirectoryInProject,
        moveDirectory,
        renameDirectory,
    };
};