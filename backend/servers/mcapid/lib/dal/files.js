const path = require('path');

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
        return await r.table('datafiles').get(fileId).merge((file) => {
            return {
                directory: r.table('datadir2datafile').getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.table('datadirs')).zip()
                    .without('datadir_id', 'datafile_id').nth(0).pluck('name', 'id'),
                versions: r.db('materialscommons').table('datadir2datafile')
                    .getAll(fileId, {index: 'datafile_id'})
                    .eqJoin('datadir_id', r.db('materialscommons').table('datadir2datafile'), {index: 'datadir_id'}).zip()
                    .eqJoin('datafile_id', r.db('materialscommons').table('datafiles')).zip()
                    .filter(f => f('id').ne(fileId).and(f('name').eq(file('name'))))
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

    async function renameFile(fileId, name) {
        await r.table('datafiles').get(fileId).update({name: name});
        return true;
    }

    async function linkFilesByNameToProcessAndSample(files, processId, sampleId, projectId) {
        // get file ids
        let paths = files.map(f => f.path);
        let filesById = [];
        for (let filePath of paths) {
            let results = await fileByPath(projectId, filePath);
            if (results.length) {
                filesById.push({file_id: results[0].datafile_id, direction: f.direction});
            }
        }

        return await linkFilesByIdToProcessAndSample(filesById, processId, sampleId);
    }

    async function fileByPath(projectId, filePath) {
        let fileName = path.basename(filePath);
        let dir = path.dirname(filePath);
        return await r.table('datadirs').getAll(dir, {index: 'name'})
            .eqJoin('id', r.table('project2datadir'), {index: 'datadir_id'}).zip()
            .filter({project_id: projectId})
            .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
            .eqJoin('datafile_id', r.table('datafiles')).zip()
            .filter({current: true, name: fileName});
    }

    async function linkFilesByIdToProcessAndSample(files, processId, sampleId) {
        await updateProcessFiles(processId, files);
        await updateSampleFiles(sampleId, files);

        return true;
    }

    async function updateProcessFiles(processId, files) {
        let filesToAddToProcess = files.map(f => {
            let direction = '';
            if (f.direction) {
                switch (f.direction) {
                    case 'in':
                        direction = 'in';
                        break;
                    case 'out':
                        direction = 'out';
                        break;
                    default:
                        break;
                }
            }

            return new model.Process2File(processId, f.file_id, direction);
        });

        filesToAddToProcess = await removeExistingProcessFileEntries(processId, filesToAddToProcess);
        if (filesToAddToProcess.length) {
            await r.table('process2file').insert(filesToAddToProcess);
        }

        return true;
    }

    async function removeExistingProcessFileEntries(processId, files) {
        if (files.length) {
            let indexEntries = files.map(f => [processId, f.file_id]);
            let matchingEntries = await r.table('process2file').getAll(r.args(indexEntries), {index: 'process_datafile'});
            let byFileID = _.keyBy(matchingEntries, 'datafile_id');
            return files.filter(f => (!(f.file_id in byFileID)));
        }

        return files;
    }

    async function updateSampleFiles(sampleId, files) {
        let fileSamplesToAdd = files.map(f => new model.Sample2Datafile(sampleId, f.file_id));
        fileSamplesToAdd = await removeExistingSampleFileEntries(fileSamplesToAdd);
        if (fileSamplesToAdd.length) {
            await r.table('sample2datafile').insert(fileSamplesToAdd);
        }

        return true;
    }

    async function removeExistingSampleFileEntries(sampleFileEntries) {
        if (sampleFileEntries.length) {
            let indexEntries = sampleFileEntries.map(entry => [entry.sample_id, entry.file_id]);
            let matchingEntries = await r.table('sample2datafile').getAll(r.args(indexEntries), {index: 'sample_file'});
            let byFileID = _.keyBy(matchingEntries, 'datafile_id');
            return sampleFileEntries.filter(entry => (!(entry.file_id in byFileID)));
        }
        return sampleFileEntries;
    }

    return {
        uploadFileToProjectDirectory,
        moveFileToDirectory,
        getFile,
        renameFile,
        linkFilesByNameToProcessAndSample,
        linkFilesByIdToProcessAndSample,
        updateProcessFiles,
        updateSampleFiles,
    };
};