module.exports = function(r) {
    let fl = require('./file-upload')(r);
    return {
        createDirsFromParent: require('./create-dir')(r).createDirsFromParent,
        deleteDirsAndFilesInDirectoryFromProject: require('./delete')(r).deleteDirsAndFilesInDirectoryFromProject,
        addFileToDirectoryInProject: fl.addFileToDirectoryInProject,
        createFile: fl.createFile,
    };
};