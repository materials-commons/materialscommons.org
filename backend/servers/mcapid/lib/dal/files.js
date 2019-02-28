module.exports = function(r) {

    const {addFileToDirectoryInProject} = require('./dir-utils')(r);

    const uploadFileToProjectDirectory = async(file, projectId, directoryId, userId) => {
        let upload = await addFileToDirectoryInProject(file, directoryId, projectId, userId);
        return upload;
    };

    const moveFileToDirectory = async(fileId, oldDirectoryId, newDirectoryId) => {
        await r.table('datadir2datafile').getAll([oldDirectoryId, fileId], {index: 'datadir_datafile'})
            .update({datadir_id: newDirectoryId});
        return await getFile(fileId);
    };

    const getFile = async(fileId) => {
        return await r.table('datafiles').get(fileId).merge(() => {
            return {
                directory: r.table('datadir2datafile').getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.table('datadirs')).zip()
                    .without('datadir_id', 'datafile_id').nth(0)
            };
        });
    };

    return {
        uploadFileToProjectDirectory,
        moveFileToDirectory,
        getFile,
    };
};