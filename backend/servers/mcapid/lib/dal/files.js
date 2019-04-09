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
                    .without('datadir_id', 'datafile_id').nth(0).pluck('name', 'id'),
                versions: r.db('materialscommons').table('datadir2datafile')
                    .getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.db('materialscommons').table('datadir2datafile'), {index: 'datadir_id'}).zip()
                    .eqJoin('datafile_id', r.db('materialscommons').table('datafiles')).zip()
                    .filter(f => f('id').ne(fileId))
                    .coerceTo('array'),
                samples: r.table('sample2datafile').getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('sample_id', r.table('samples')).zip()
                    .pluck('name', 'id', 'owner', 'birthtime')
                    .merge(s => {
                        return {
                            files_count: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'}).count(),
                            processes_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).pluck('process_id').distinct().count(),
                        };
                    }).coerceTo('array'),
                processes: r.table('process2file').getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('process_id', r.table('processes')).zip()
                    .pluck('name', 'id', 'owner', 'birthtime')
                    .merge(proc => {
                        return {
                            files_count: r.table('process2file').getAll(proc('id'), {index: 'process_id'}).count(),
                            samples_count: r.table('process2sample').getAll(proc('id'), {index: 'process_id'}).count(),
                        };
                    })
                    .distinct().coerceTo('array'),
                tags: r.table('tag2item').getAll(fileId, {index: 'item_id'}).orderBy('tag_id').pluck('tag_id').coerceTo('array'),
            };
        });
    }

    return {
        uploadFileToProjectDirectory,
        moveFileToDirectory,
        getFile,
    };
};