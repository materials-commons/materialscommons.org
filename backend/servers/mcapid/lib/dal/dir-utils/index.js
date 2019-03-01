module.exports = function(r) {
    let fl = require('./file-upload')(r);
    let move = require('./move')(r);

    return {
        createDirsFromParent: require('./create-dir')(r).createDirsFromParent,
        deleteDirsAndFilesInDirectoryFromProject: require('./delete')(r).deleteDirsAndFilesInDirectoryFromProject,
        addFileToDirectoryInProject: fl.addFileToDirectoryInProject,
        createFile: fl.createFile,
        moveDir: move.moveDir,
        renameDir: move.renameDir,
    };
};