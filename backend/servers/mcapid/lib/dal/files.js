module.exports = function(r) {

    const {addFileToDirectoryInProject} = require('./dir-utils')(r);

    async function uploadFileToProjectDirectory(file, projectId, directoryId, userId) {
        return await addFileToDirectoryInProject(file, directoryId, projectId, userId);
    }

    async function moveFileToDirectory(fileId, oldDirectoryId, newDirectoryId) {
        let rv = await r.table('datadir2datafile').getAll([oldDirectoryId, fileId], {index: 'datadir_datafile'})
            .update({datadir_id: newDirectoryId});
        if (!rv.replaced) {
            throw new Error(`Unable to move file ${fileId} in directory ${oldDirectoryId} into directory ${newDirectoryId}`);
        }
        return await getFile(fileId);
    }

    async function getFile(fileId) {
        return await r.table('datafiles').get(fileId).merge(() => {
            return {
                directory: r.table('datadir2datafile').getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.table('datadirs')).zip()
                    .without('datadir_id', 'datafile_id').nth(0)
            };
        });
    }

    return {
        uploadFileToProjectDirectory,
        moveFileToDirectory,
        getFile,
    };
};