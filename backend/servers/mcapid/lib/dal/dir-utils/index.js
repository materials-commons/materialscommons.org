module.exports = function(r) {
    return {
        createDirsFromParent: require('./create-dir')(r).createDirsFromParent,
        deleteDirsAndFilesInDirectoryFromProject: require('./delete')(r).deleteDirsAndFilesInDirectoryFromProject,
        addFileToDirectoryInProject: require('./file-upload')(r).addFileToDirectoryInProject,
    };
};