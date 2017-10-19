const r = require('actionhero').api.r;
const processCommon = require('./process-common');

const allSamplesInDataset = async (datasetId, sampleIds) => {
    let indexArgs = sampleIds.map(sid => [datasetId, sid]);
    let samples = await r.table('dataset2sample').getAll(r.args(indexArgs), {index: 'dataset_sample'});
    return samples.length === sampleIds.length;
};

const allFilesInDataset = async (datasetId, fileIds) => {
    let indexArgs = fileIds.map(fid => [datasetId, fid]);
    let files = await r.table('dataset2datafile').getAll(r.args(indexArgs), {index: 'dataset_datafile'});
    return files.length === fileIds.length;
};

const allProcessesInDataset = async (datasetId, processIds) => {
    let indexArgs = processIds.map(id => [datasetId, id]);
    let processes = await r.table('dataset2process').getAll(r.args(indexArgs), {index: 'dataset_process'});
    return processes.length === processIds.length;
};

const allFilesInProject = async(projectId, fileIds) => {
    let indexArgs = fileIds.map(fid => [projectId, fid]);
    let matches = await r.table('project2datafile').getAll(r.args(indexArgs), {index: 'project_datafile'});
    return matches.length === fileIds.length;
};

const experimentExistsInProject = async(projectID, experimentID) => {
    let matches = await r.table('project2experiment').getAll([projectID, experimentID], {index: 'project_experiment'});
    return matches.length !== 0;
};

const taskInExperiment= async(experimentID, taskId) => {
    let matches = await r.table('experiment2experimenttask')
        .getAll([experimentID, taskId], {index: 'experiment_experiment_task'});
    return matches.length !== 0;
};

const noteInExperiment= async(experimentID, experimentNoteID) => {
    let matches = await r.table('experiment2experimentnote')
        .getAll([experimentID, experimentNoteID], {index: 'experiment_experiment_note'});
    return matches.length !== 0;
};

const taskIsUsingProcess= async(taskID) => {
    let task = await r.table('experimenttasks').get(taskID);
    return task.process_id !== '';
};

const templateExists= async(templateId) => {
    let matches = await r.table('templates').getAll(templateId);
    return matches.length !== 0;
};

const templateIsOwnedBy= async(templateId, userId) => {
    let templateOwner = await r.table('templates').get(templateId).getField('owner');
    return templateOwner === userId;
};

const isTemplateAdmin= async(userId) => {
    let user = await r.table('users').get(userId);
    return (user && (user.is_template_admin))
};

const isTemplateForTask= async(templateId, taskId) => {
    let task = await r.table('experimenttasks').get(taskId);
    return task.template_id === templateId;
};

const isTemplateForProcess= async(templateId, processId) => {
    let process = await r.table('processes').get(processId);
    return process.template_id === templateId;
};

const allSamplesInExperiment= async(experimentId, sampleIds) => {
    let indexArgs = sampleIds.map((sampleId) => [experimentId, sampleId]);
    let samples = await r.table('experiment2sample').getAll(r.args(indexArgs), {index: 'experiment_sample'});
    return samples.length === sampleIds.length;
};

const allFilesInExperiment= async(experimentId, fileIds) => {
    let indexArgs = fileIds.map((fileId) => [experimentId, fileId]);
    let files = await r.table('experiment2datafile').getAll(r.args(indexArgs), {index: 'experiment_datafile'});
    return files.length === fileIds.length;
};

const allProcessesInExperiment= async(experimentId, processIds) => {
    let indexArgs = processIds.map((id) => [experimentId, id]);
    let processes = await r.table('experiment2process').getAll(r.args(indexArgs), {index: 'experiment_process'});
    return processes.length === processIds.length;
};

const allSamplesInProcess= async(processId, samples) => {
    let indexArgs = samples.map(s => [processId, s.sample_id, s.property_set_id]);
    let matches = await r.table('process2sample').getAll(r.args(indexArgs), {index: 'process_sample_property_set'});
    return matches.length === samples.length;
};

const allFilesInProcess= async(processId, files) => {
    let indexArgs = files.map(f => [processId, f.id]);
    let matches = await r.table('process2file').getAll(r.args(indexArgs), {index: 'process_datafile'});
    return files.length === matches.length;
};

const allExperimentsInProject= async(projectId, experimentIds) => {
    let indexArgs = experimentIds.map(id => [projectId, id]);
    let matches = await r.table('project2experiment').getAll(r.args(indexArgs), {index: 'project_experiment'});
    return matches.length === experimentIds.length;
};

const sampleInExperiment= async(experimentId, sampleId) => {
    let samples = await r.table('experiment2sample').getAll([experimentId, sampleId], {index: 'experiment_sample'});
    return samples.length !== 0;
};

const processInExperiment= async(experimentId, processId) => {
    let processes = await r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'});
    return processes.length !== 0;
};

const fileInProject= async(fileId, projectId) => {
    let files = await r.table('project2datafile').getAll([projectId, fileId], {index: 'project_datafile'});
    return files.length !== 0;
};

const experimentHasDataset= async(experimentId, datasetId) => {
    let datasets = await r.table('experiment2dataset').getAll([experimentId, datasetId], {index: 'experiment_dataset'});
    return datasets.length !== 0;
};

const taskProcessIsUnused= async(taskId) => {
    let task = await r.table('experimenttasks').get(taskId);
    if (task.process_id === '') {
        return true;
    }

    return await processCommon.processIsUnused(task.process_id);
};

const sampleInProject= async(projectId, sampleId) => {
    let samples = await r.table('project2sample').getAll([projectId, sampleId], {index: 'project_sample'});
    return samples.length !== 0;
};

const sampleHasPropertySet= async(sampleId, propertySetId) => {
    let samples = await r.table('sample2propertyset').getAll([sampleId, propertySetId], {index: 'sample_property_set'});
    return samples.length !== 0;
};

const allSamplesInProject= async(projectId, sampleIds) => {
    let indexArgs = sampleIds.map((sampleId) => [projectId, sampleId]);
    let samples = await r.table('project2sample').getAll(r.args(indexArgs), {index: 'project_sample'});
    return samples.length === sampleIds.length;
};

const userHasProjectAccess= async(userId, projectId) => {
    let accessEntries = await r.table('access').getAll([userId, projectId], {index: 'user_project'});
    return accessEntries.length !== 0;
};

const isUserProjectOwner= async(userId, projectId) => {
    let projectOwner = await r.table('projects').get(projectId).getField('owner');
    return userId === projectOwner;
};

const isUserExperimentOwner= async(userId, projectId) => {
    let projectOwner = await r.table('experiments').get(projectId).getField('owner');
    return userId === projectOwner;
};

const directoryInProject= async(projectId, directoryId) => {
    let matches = await r.table('project2datadir').getAll([projectId, directoryId], {index: 'project_datadir'});
    return matches.length !== 0;
};

const processInProject= async(projectId, processId) => {
    let matches = await r.table('project2process').getAll([projectId, processId], {index: 'project_process'});
    return matches.length !== 0;
};

const processInPublishedDataset= async(processId) => {
    let datasets = await r.table('dataset2process').getAll(processId, {index: 'process_id'})
        .eqJoin('dataset_id', r.table('datasets')).zip();
    let publishedDatasets = datasets.filter(d => d.published);
    return publishedDatasets.length !== 0;
};

module.exports = {
    allSamplesInDataset,
    allFilesInDataset,
    allProcessesInDataset,
    allFilesInProject,
    allExperimentsInProject,
    experimentExistsInProject,
    taskInExperiment,
    noteInExperiment,
    taskIsUsingProcess,
    templateExists,
    templateIsOwnedBy,
    isTemplateAdmin,
    isTemplateForTask,
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
    taskProcessIsUnused,
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
