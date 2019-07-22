module.exports = function (r) {

    async function allFilesInProject(fileIds, projectId) {
        let indexArgs = fileIds.map(fid => [projectId, fid]);
        let matches = await r.table('project2datafile').getAll(r.args(indexArgs), {index: 'project_datafile'});
        return matches.length === fileIds.length;
    }

    async function allDirectoriesInProject(directoryIds, projectId) {
        let indexArgs = directoryIds.map(dirId => [projectId, dirId]);
        let matches = await r.table('project2datadir').getAll(r.args(indexArgs), {index: 'project_datadir'});
        return matches.length === directoryIds.length;
    }

    async function directoryInProject(directoryId, projectId) {
        return await allDirectoriesInProject([directoryId], projectId);
    }

    async function allFilesInDirectory(fileIds, directoryId) {
        let indexArgs = fileIds.map(fid => [directoryId, fid]);
        let matches = await r.table('datadir2datafile').getAll(r.args(indexArgs), {index: 'datadir_datafile'});
        return matches.length === fileIds.length;
    }

    async function allSamplesInProject(sampleIds, projectId) {
        let indexArgs = sampleIds.map(sid => [projectId, sid]);
        let matches = await r.table('project2sample').getAll(r.args(indexArgs), {index: 'project_sample'});
        return matches.length === sampleIds.length;
    }

    async function sampleInProject(sampleId, projectId) {
        return await allSamplesInProject([sampleId], projectId);
    }

    async function datasetInProject(datasetId, projectId) {
        let d = await r.table('project2dataset').getAll([projectId, datasetId], {index: 'project_dataset'});
        return d.length !== 0;
    }

    async function datasetIsPublished(datasetId) {
        let ds = await r.table('datasets').get(datasetId);
        if (!ds) {
            return false;
        } else if (ds.published) {
            return true;
        } else {
            return ds.is_published_private;
        }
    }

    async function fileInProject(fileId, projectId) {
        return allFilesInProject([fileId], projectId);
    }

    async function fileInDirectory(fileId, directoryId) {
        return allFilesInDirectory([fileId], directoryId);
    }

    async function isProjectOwner(projectId, userId) {
        let project = await r.table('projects').get(projectId);
        return project.owner === userId;
    }

    async function userExists(userId) {
        return await r.table('users').getAll(userId).count() === 1;
    }

    async function experimentNameIsUniqueInProject(name, projectId) {
        let experiments = await r.table('project2experiment').getAll(projectId, {index: 'project_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip().filter({name: name});
        return experiments.length === 0;
    }

    async function experimentInProject(experimentId, projectId) {
        let matches = await r.table('project2experiment').getAll([projectId, experimentId], {index: 'project_experiment'});
        return matches.length !== 0;
    }

    async function processInProject(processId, projectId) {
        let matches = await r.table('project2process').getAll([projectId, processId], {index: 'project_process'});
        return matches.length !== 0;
    }

    async function propertyInProject(propertyId, projectId) {
        let results = await r.table('propertyset2property').getAll(propertyId, {index: 'property_id'})
            .eqJoin('property_set_id', r.table('sample2propertyset'), {index: 'property_set_id'}).zip();
        if (results.length === 0) {
            return false;
        }

        let sampleId = results[0].sample_id;

        return await sampleInProject(sampleId, projectId);
    }

    async function objectInProject(objectType, objectId, projectId) {
        switch (objectType) {
            case 'experiment':
                return await experimentInProject(objectId, projectId);
            case 'file':
                return await fileInProject(objectId, projectId);
            case 'directory':
                return await directoryInProject(objectId, projectId);
            case 'sample':
                return await sampleInProject(objectId, projectId);
            case 'process':
                return await processInProject(objectId, projectId);
            case 'dataset':
                return await datasetInProject(objectId, projectId);
            case 'sample_attribute':
                return await propertyInProject(objectId, projectId);
            default:
                return false;
        }
    }

    return {
        allFilesInProject,
        allDirectoriesInProject,
        allFilesInDirectory,
        allSamplesInProject,
        sampleInProject,
        datasetInProject,
        datasetIsPublished,
        directoryInProject,
        fileInProject,
        fileInDirectory,
        isProjectOwner,
        userExists,
        experimentNameIsUniqueInProject,
        experimentInProject,
        processInProject,
        objectInProject,
    };
};