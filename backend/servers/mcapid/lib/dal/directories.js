const r = require('../../../shared/r');
const path = require('path');

const getDirectoryForProject = async(dirId, projectId) => {
    if (dirId === 'root') {
        return await getProjectRoot(projectId);
    }

    return await getDirectoryByIdForProject(dirId, projectId);
};

const getProjectRoot = async(projectId) => {
    let root = await r.table('projects').getAll(projectId)
        .eqJoin([projectId, r.row('name')], r.table('datadirs'), {index: 'datadir_project_name'}).zip()
        .merge(filesAndDirsRql).nth(0);
    return transformDir(root);
};

const getDirectoryByIdForProject = async(dirId, projectId) => {
    let dir = await r.table('project2datadir').getAll([projectId, dirId], {index: 'project_datadir'})
        .eqJoin('datadir_id', r.table('datadirs')).zip()
        .merge(filesAndDirsRql).nth(0);
    return transformDir(dir);
};

function filesAndDirsRql(ddir) {
    return {
        files: r.table('datadir2datafile').getAll(ddir('id'), {index: 'datadir_id'})
            .eqJoin('datafile_id', r.table('datafiles')).zip()
            .filter({current: true})
            .coerceTo('array'),
        directories: r.table('datadirs').getAll(ddir('id'), {index: 'parent'}).coerceTo('array')
    };
}

const getDirectoryByPathForProject = async(path, projectId) => {
    let dir = await r.table('datadirs').getAll([projectId, path], {index: 'datadir_project_name'})
        .merge(filesAndDirsRql).nth(0);
    return transformDir(dir);
};

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

module.exports = {
    getDirectoryForProject,
    getDirectoryByPathForProject,
};