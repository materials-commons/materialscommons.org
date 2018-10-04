const r = require('../r');
const processCommon = require('./process-common');

function* allSamplesInDataset(datasetId, sampleIds) {
    let indexArgs = sampleIds.map(sid => [datasetId, sid]);
    let samples = yield r.table('dataset2sample').getAll(r.args(indexArgs), {index: 'dataset_sample'});
    return samples.length === sampleIds.length;
}

function* allFilesInDataset(datasetId, fileIds) {
    let indexArgs = fileIds.map(fid => [datasetId, fid]);
    let files = yield r.table('dataset2datafile').getAll(r.args(indexArgs), {index: 'dataset_datafile'});
    return files.length === fileIds.length;
}

function* allProcessesInDataset(datasetId, processIds) {
    let indexArgs = processIds.map(id => [datasetId, id]);
    let processes = yield r.table('dataset2process').getAll(r.args(indexArgs), {index: 'dataset_process'});
    return processes.length === processIds.length;
}

function* allFilesInProject(projectId, fileIds) {
    let indexArgs = fileIds.map(fid => [projectId, fid]);
    let matches = yield r.table('project2datafile').getAll(r.args(indexArgs), {index: 'project_datafile'});
    return matches.length === fileIds.length;
}

function* experimentExistsInProject(projectID, experimentID) {
    let matches = yield r.table('project2experiment').getAll([projectID, experimentID], {index: 'project_experiment'});
    return matches.length !== 0;
}

function* noteInExperiment(experimentID, experimentNoteID) {
    let matches = yield r.table('experiment2experimentnote')
        .getAll([experimentID, experimentNoteID], {index: 'experiment_experiment_note'});
    return matches.length !== 0;
}

function* commentExists(commentId) {
    let matches = yield r.table('comments').getAll(commentId);
    return matches.length !== 0;
}

function* commentIsOwnedBy(commentId, userId) {
    let commentOwner = yield r.table('comments').get(commentId).getField('owner');
    return commentOwner === userId;
}

function* templateExists(templateId) {
    let matches = yield r.table('templates').getAll(templateId);
    return matches.length !== 0;
}

function* templateIsOwnedBy(templateId, userId) {
    let templateOwner = yield r.table('templates').get(templateId).getField('owner');
    return templateOwner === userId;
}

function* isTemplateAdmin(userId) {
    let user = yield r.table('users').get(userId);
    return (user && (user.is_template_admin))
}

function* isTemplateForProcess(templateId, processId) {
    let process = yield r.table('processes').get(processId);
    return process.template_id === templateId;
}

function* allSamplesInExperiment(experimentId, sampleIds) {
    let indexArgs = sampleIds.map((sampleId) => [experimentId, sampleId]);
    let samples = yield r.table('experiment2sample').getAll(r.args(indexArgs), {index: 'experiment_sample'});
    return samples.length === sampleIds.length;
}

function* allFilesInExperiment(experimentId, fileIds) {
    let indexArgs = fileIds.map((fileId) => [experimentId, fileId]);
    let files = yield r.table('experiment2datafile').getAll(r.args(indexArgs), {index: 'experiment_datafile'});
    return files.length === fileIds.length;
}

function* allProcessesInExperiment(experimentId, processIds) {
    let indexArgs = processIds.map((id) => [experimentId, id]);
    let processes = yield r.table('experiment2process').getAll(r.args(indexArgs), {index: 'experiment_process'});
    return processes.length === processIds.length;
}

function* allSamplesInProcess(processId, samples) {
    let indexArgs = samples.map(s => [processId, s.sample_id, s.property_set_id]);
    let matches = yield r.table('process2sample').getAll(r.args(indexArgs), {index: 'process_sample_property_set'});
    return matches.length === samples.length;
}

function* allFilesInProcess(processId, files) {
    let indexArgs = files.map(f => [processId, f.id]);
    let matches = yield r.table('process2file').getAll(r.args(indexArgs), {index: 'process_datafile'});
    return files.length === matches.length;
}

function* allExperimentsInProject(projectId, experimentIds) {
    let indexArgs = experimentIds.map(id => [projectId, id]);
    let matches = yield r.table('project2experiment').getAll(r.args(indexArgs), {index: 'project_experiment'});
    return matches.length === experimentIds.length;
}

function* sampleInExperiment(experimentId, sampleId) {
    let samples = yield r.table('experiment2sample').getAll([experimentId, sampleId], {index: 'experiment_sample'});
    return samples.length !== 0;
}

function* processInExperiment(experimentId, processId) {
    let processes = yield r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'});
    return processes.length !== 0;
}

function* fileInProject(fileId, projectId) {
    let files = yield r.table('project2datafile').getAll([projectId, fileId], {index: 'project_datafile'});
    return files.length !== 0;
}

function* experimentHasDataset(experimentId, datasetId) {
    let datasets = yield r.table('experiment2dataset').getAll([experimentId, datasetId], {index: 'experiment_dataset'});
    return datasets.length !== 0;
}

function * projectHasDataset (projectId, datasetId) {
    let datasets = yield r.table('project2dataset').getAll([projectId, datasetId], {index: 'project_dataset'});
    return datasets.length !== 0;
}

function* sampleInProject(projectId, sampleId) {
    let samples = yield r.table('project2sample').getAll([projectId, sampleId], {index: 'project_sample'});
    return samples.length !== 0;
}

function* sampleHasPropertySet(sampleId, propertySetId) {
    let samples = yield r.table('sample2propertyset').getAll([sampleId, propertySetId], {index: 'sample_property_set'});
    return samples.length !== 0;
}

function* allSamplesInProject(projectId, sampleIds) {
    let indexArgs = sampleIds.map((sampleId) => [projectId, sampleId]);
    let samples = yield r.table('project2sample').getAll(r.args(indexArgs), {index: 'project_sample'});
    return samples.length === sampleIds.length;
}

function* userHasProjectAccess(userId, projectId) {
    let accessEntries = yield r.table('access').getAll([userId, projectId], {index: 'user_project'});
    return accessEntries.length !== 0;
}

function* isUserProjectOwner(userId, projectId) {
    let projectOwner = yield r.table('projects').get(projectId).getField('owner');
    return userId === projectOwner;
}

function* isUserExperimentOwner(userId, experimentId, projectId) {
    let projectOwner = yield r.table('projects').get(projectId).getField('owner');
    let experimentOwner = yield r.table('experiments').get(experimentId).getField('owner');
    if (projectOwner === userId) {
        return true;
    } else if (experimentOwner === userId) {
        return true;
    }
    return false;
}

function* directoryInProject(projectId, directoryId) {
    let matches = yield r.table('project2datadir').getAll([projectId, directoryId], {index: 'project_datadir'});
    return matches.length !== 0;
}

function* processInProject(projectId, processId) {
    let matches = yield r.table('project2process').getAll([projectId, processId], {index: 'project_process'});
    return matches.length !== 0;
}

function* processInPublishedDataset(processId) {
    let datasets = yield r.table('dataset2process').getAll(processId, {index: 'process_id'})
        .eqJoin('dataset_id', r.table('datasets')).zip();
    let publishedDatasets = datasets.filter(d => d.published);
    return publishedDatasets.length !== 0;
}

module.exports = {
    allSamplesInDataset,
    allFilesInDataset,
    allProcessesInDataset,
    allFilesInProject,
    allExperimentsInProject,
    experimentExistsInProject,
    noteInExperiment,
    commentExists,
    commentIsOwnedBy,
    templateExists,
    templateIsOwnedBy,
    isTemplateAdmin,
    isTemplateForProcess,
    allSamplesInExperiment,
    allFilesInExperiment,
    allProcessesInExperiment,
    allSamplesInProcess,
    allFilesInProcess,
    sampleInExperiment,
    processInExperiment,
    fileInProject,
    experimentHasDataset,
    projectHasDataset,
    sampleInProject,
    sampleHasPropertySet,
    allSamplesInProject,
    userHasProjectAccess,
    isUserProjectOwner,
    isUserExperimentOwner,
    directoryInProject,
    processInProject,
    processInPublishedDataset
};
