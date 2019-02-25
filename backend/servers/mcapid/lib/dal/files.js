module.exports = function(r) {

    const {addFileToDirectoryInProject} = require('./dir-utils')(r);

    const uploadFileToProjectDirectory = async(file, projectId, directoryId) => {
        return await addFileToDirectoryInProject(file, directoryId, projectId);
    };

    return {
        uploadFileToProjectDirectory,
    };
};