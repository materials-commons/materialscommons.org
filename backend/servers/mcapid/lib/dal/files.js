module.exports = function(r) {

    const {addFileToDirectoryInProject} = require('./dir-utils')(r);

    const uploadFileToProjectDirectory = async(file, projectId, directoryId, userId) => {
        let upload = await addFileToDirectoryInProject(file, directoryId, projectId, userId);
        return upload;
    };

    return {
        uploadFileToProjectDirectory,
    };
};