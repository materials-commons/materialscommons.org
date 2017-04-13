const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

const experimentDatasets = require('./experiment-datasets');
const experiments = require('./experiments');
const processes = require('./processes');

function* deleteExperiment(projectId, experimentId, options) {

    let deleteProcesses = !!(options && options.deleteProcesses);
    let dryRun = !!(options && options.dryRun);

    console.log("deleteProcesses: ", deleteProcesses);
    console.log("dryRun: ", dryRun);

    let overallResults = {};

    let results = yield experimentDatasets.getDatasetsForExperiment(experimentId);
    let datasetList = results.val;

    let hasPublishedDatasets = false;
    for (let i = 0; i < datasetList.length; i++) {
        let dataset = datasetList[i];
        if (dataset.published) {
            hasPublishedDatasets = true;
        }
    }
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let idList = [];
    for (let i = 0; i < datasetList.length; i++) {
        let dataset = datasetList[i];
        results = yield experimentDatasets.deleteDataset(dataset.id);
        if (results && results.val) {
            idList.push(dataset.id);
        }
    }
    overallResults['datasets'] = idList;

    idList = yield r.table('experiment2sample')
        .getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'}).zip()
        .eqJoin('property_set_id', r.table('propertysets')).zip()
        .eqJoin('property_set_id', r.table('propertyset2property'), {index: 'property_set_id'}).zip()
        .eqJoin('property_id', r.table('properties')).zip()
        .eqJoin('property_id', r.table('best_measure_history'), {index: 'property_id'}).zip()
        .getField('property_id');
    let delete_msg = yield r.table('best_measure_history')
        .getAll(r.args([...idList]), {index: 'property_id'}).delete();
    if (delete_msg.deleted === idList.length) {
        overallResults['best_measure_history'] = idList;
    } // else ?

    let sampleIdSet = new Set();
    idList = [];
    let simple = true;
    results = yield experiments.getProcessesForExperiment(experimentId, simple);
    let processList = results.val;

    for (let i = 0; i < processList.length; i++) {
        let process = processList[i];
        for (let j = 0; j < process.input_samples.length; j++) {
            let id = process.input_samples[j].id;
            sampleIdSet.add(id);
        }
        for (let j = 0; j < process.output_samples.length; j++) {
            let id = process.output_samples[j].id;
            sampleIdSet.add(id);
        }
        idList.push(process.id);
        yield processes.deleteProcess(projectId, process.id);
    }

    overallResults['processes'] = idList;

    let sampleList = yield r.db('materialscommons').table('experiment2sample')
        .getAll(experimentId,{index:'experiment_id'})
        .eqJoin('sample_id',r.db('materialscommons').table('samples')).zip()
        .getField('sample_id');

    results = yield r.table('samples').getAll(r.args([...sampleList])).delete();
    if (results.deleted === sampleList.length) {
        for (let i = 0; i < sampleList.length; i++) {
            let id = sampleList[i];
            sampleIdSet.add(id);
        }
    } // else?

    overallResults['samples'] = [...sampleIdSet];

    idList = yield r.table('experiment2experimentnote')
        .getAll(experimentId,{index:'experiment_id'})
        .eqJoin('experiment_note_id',r.table('experimentnotes'))
        .zip().getField('experiment_note_id');

    let delete_msg1 = yield r.table('experimentnotes').getAll(r.args([...idList])).delete();

    let delete_msg2 = yield r.table('experiment2experimentnote')
        .getAll(experimentId,{index:'experiment_id'}).delete();

    if ((delete_msg1.deleted === idList.length) && (delete_msg2.deleted === idList.length)) {
        overallResults['experiment_notes'] = idList;
    }

    // get taskId and processId
    let taskidList = yield r.table('experiment2experimenttask')
        .getAll(experimentId,{index:'experiment_id'})
        .eqJoin('experiment_task_id',r.table('experimenttasks'))
        .zip().getField('experiment_task_id');

    idList = yield r.table('experimenttask2process')
        .getAll(r.args([...taskidList]),{index:'experiment_task_id'})
        .eqJoin('process_id',r.table('processes'))
        .zip().getField('process_id');
    delete_msg = yield r.table('processes').getAll(r.args([...idList])).delete();
    if (delete_msg.deleted === idList.length) {
        overallResults['experiment_task_processes'] = idList;
    }

    yield r.table('experimenttask2process')
        .getAll(taskidList,{index:'experiment_task_id'}).delete();

    delete_msg = yield r.table('experimenttasks').getAll(r.args([...taskidList])).delete();
    if (delete_msg.deleted === taskidList.length) {
        overallResults['experiment_tasks'] = taskidList;
    }

    delete_msg = yield r.table('experiment2experimenttask')
        .getAll(experimentId,{index:'experiment_id'}).delete();

    return {val: overallResults};
}

module.exports = {
    deleteExperiment
};