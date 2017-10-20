const r = require('actionhero').api.r;
const experimentDatasets = require('./experiment-datasets');
const experiments = require('./experiments');
const processes = require('./processes');

async function quickDeleteExperiment(projectId, experimentId) {
    let hasPublishedDatasets = await testForPublishedDatasets(experimentId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let hasDOIAssigned = await testForDOIAssigned(experimentId);
    if (hasDOIAssigned) {
        return {error: "Can not delete an experiment with a dataset that has a DOI assigned"}
    }

    await r.table('project2experiment').getAll(experimentId, {index: 'experiment_id'}).delete();

    const sampleGroups = await r.db('materialscommons').table('experiment2sample').group('sample_id');
    const samplesToDelete = sampleGroups.filter(sg => sg.reduction.length < 2 && sg.group[0].experiment_id === experimentId)
        .map(sg => sg.group);
    await r.table('project2sample').getAll(samplesToDelete, {index: 'sample_id'}).delete();
    return {val: {experiment_id: experimentId}};
}

async function deleteExperimentFull(projectId, experimentId, options) {

    let deleteProcesses = !!(options && options.deleteProcesses);
    let dryRun = !!(options && options.dryRun);

    let hasPublishedDatasets = await testForPublishedDatasets(experimentId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let hasDOIAssigned = await testForDOIAssigned(experimentId);
    if (hasDOIAssigned) {
        return {error: "Can not delete an experiment with a dataset that has a DOI assigned"}
    }

    let overallResults = {};

    overallResults['datasets'] = await deleteDataSets(experimentId, dryRun);

    if (deleteProcesses) {
        let partialResults = await deleteProcessesSamplesSetupAndMeasure(projectId, experimentId, dryRun);
        overallResults['best_measure_history'] = partialResults.best_measure_history;
        overallResults['processes'] = partialResults.processes;
        overallResults['samples'] = partialResults.samples;
    } else {
        overallResults['best_measure_history'] = [];
        overallResults['processes'] = [];
        overallResults['samples'] = [];
    }
    overallResults['experiment_notes'] = await deleteExperimentNotes(experimentId, dryRun);

    let partialResults = await deleteExperimentTasks(experimentId, dryRun);
    overallResults['experiment_task_processes'] = partialResults.experiment_task_processes;
    overallResults['experiment_tasks'] = partialResults.experiment_tasks;

    let allPossibleItems = await deleteExperimentFileLinks(experimentId, dryRun);

    allPossibleItems = allPossibleItems.concat(overallResults.processes);
    allPossibleItems = allPossibleItems.concat(overallResults.samples);

    overallResults['notes'] = await deleteNotes(allPossibleItems, dryRun);
    overallResults['reviews'] = await deleteReviews(allPossibleItems, dryRun);

    if (!dryRun) {
        await clearAllRemainingLinks(experimentId);
        await r.table('experiments').get(experimentId).delete();
    }

    overallResults['experiments'] = [experimentId];

    return {val: overallResults};
}

async function testForPublishedDatasets(experimentId) {
    let results = await experimentDatasets.getDatasetsForExperiment(experimentId);
    let datasetList = results.val;

    let hasPublishedDatasets = false;
    for (let i = 0; i < datasetList.length; i++) {
        let dataset = datasetList[i];
        if (dataset.published) {
            hasPublishedDatasets = true;
        }
    }
    return hasPublishedDatasets;
}

async function testForDOIAssigned(experimentId) {
    let results = await experimentDatasets.getDatasetsForExperiment(experimentId);
    let datasetList = results.val;

    let hasDOIAssigned = false;
    for (let i = 0; i < datasetList.length; i++) {
        let dataset = datasetList[i];
        if (dataset.doi) {
            hasDOIAssigned = true;
        }
    }
    return hasDOIAssigned;
}

async function deleteDataSets(experimentId, dryRun) {
    let results = await experimentDatasets.getDatasetsForExperiment(experimentId);
    let datasetList = results.val;

    let idList = [];
    for (let i = 0; i < datasetList.length; i++) {
        let dataset = datasetList[i];
        if (dryRun) {
            idList.push(dataset.id);
        } else {
            results = await experimentDatasets.deleteDataset(dataset.id);
            if (results && results.val) {
                idList.push(dataset.id);
            }
        }
    }
    return idList;
}

async function deleteProcessesSamplesSetupAndMeasure(projectId, experimentId, dryRun) {
    let partialResults = {};

    let idList = await r.table('experiment2sample')
        .getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'}).zip()
        .eqJoin('property_set_id', r.table('propertysets')).zip()
        .eqJoin('property_set_id', r.table('propertyset2property'), {index: 'property_set_id'}).zip()
        .eqJoin('property_id', r.table('properties')).zip()
        .eqJoin('property_id', r.table('best_measure_history'), {index: 'property_id'}).zip()
        .getField('property_id');
    if (dryRun) {
        partialResults['best_measure_history'] = idList;
    } else {
        let delete_msg = await r.table('best_measure_history')
            .getAll(r.args([...idList]), {index: 'property_id'}).delete();
        if (delete_msg.deleted === idList.length) {
            partialResults['best_measure_history'] = idList;
        } // else ?
    }

    let sampleIdSet = new Set();
    idList = [];
    let simple = true;
    let results = await experiments.getProcessesForExperiment(experimentId, simple);
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
        if (!dryRun) {
            await processes.deleteProcessFull(projectId, process.id, {'force': true});
        }
    }

    partialResults['processes'] = idList;

    let sampleList = await r.table('experiment2sample')
        .getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .getField('sample_id');

    if (dryRun) {
        for (let i = 0; i < sampleList.length; i++) {
            let id = sampleList[i];
            sampleIdSet.add(id);
        }
    } else {
        results = await r.table('samples').getAll(r.args([...sampleList])).delete();
        if (results.deleted === sampleList.length) {
            for (let i = 0; i < sampleList.length; i++) {
                let id = sampleList[i];
                sampleIdSet.add(id);
            }
        } // else?
    }

    partialResults['samples'] = [...sampleIdSet];

    return partialResults;
}

async function deleteExperimentNotes(experimentId, dryRun) {
    let ret = [];
    let idList = await r.table('experiment2experimentnote')
        .getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('experiment_note_id', r.table('experimentnotes'))
        .zip().getField('experiment_note_id');

    if (dryRun) {
        ret = idList;
    } else {
        let delete_msg1 = await r.table('experimentnotes').getAll(r.args([...idList])).delete();

        let delete_msg2 = await r.table('experiment2experimentnote')
            .getAll(experimentId, {index: 'experiment_id'}).delete();

        if ((delete_msg1.deleted === idList.length) && (delete_msg2.deleted === idList.length)) {
            ret = idList;
        } // else?
    }

    return ret;
}

async function deleteExperimentTasks(experimentId, dryRun) {
    let partialResults = {};

    let taskidList = await r.table('experiment2experimenttask')
        .getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('experiment_task_id', r.table('experimenttasks'))
        .zip().getField('experiment_task_id');

    let idList = await r.table('experimenttask2process')
        .getAll(r.args([...taskidList]), {index: 'experiment_task_id'})
        .eqJoin('process_id', r.table('processes'))
        .zip().getField('process_id');
    if (dryRun) {
        partialResults['experiment_task_processes'] = idList;
        partialResults['experiment_tasks'] = taskidList;
    } else {
        let delete_msg = await r.table('processes').getAll(r.args([...idList])).delete();
        if (delete_msg.deleted === idList.length) {
            partialResults['experiment_task_processes'] = idList;
        }

        await r.table('experimenttask2process')
            .getAll(r.args([...taskidList]), {index: 'experiment_task_id'}).delete();

        delete_msg = await r.table('experimenttasks').getAll(r.args([...taskidList])).delete();
        if (delete_msg.deleted === taskidList.length) {
            partialResults['experiment_tasks'] = taskidList;
        }

        await r.table('experiment2experimenttask')
            .getAll(experimentId, {index: 'experiment_id'}).delete();
    }
    return partialResults;
}

async function deleteExperimentFileLinks(experimentId, dryRun) {
    let fileLinkIds = await r.table('experiment2datafile')
        .getAll(experimentId, {index: 'experiment_id'}).getField('datafile_id');

    if (!dryRun) {
        await r.table('experiment2datafile').getAll(experimentId, {index: 'experiment_id'}).delete();
    }

    return fileLinkIds;
}

async function deleteNotes(allPosibleItems, dryRun) {
    let noteIdSet = new Set();

    let noteItems = await r.table('note2item').getAll(r.args(allPosibleItems), {index: 'item_id'});
    for (let i = 0; i < noteItems.length; i++) {
        let noteId = noteItems[i].note_id;
        noteIdSet.add(noteId);
    }

    let noteIdList = [...noteIdSet];
    if (!dryRun) {
        await r.table('note2item').getAll(r.args(noteIdList), {index: 'note_id'}).delete();
        await r.table('notes').getAll(r.args(noteIdList)).delete();

    }

    return noteIdList;
}

async function deleteReviews(allPosibleItems, dryRun) {
    let reviewIdSet = new Set();

    let reviewItems = await r.table('review2item').getAll(r.args(allPosibleItems), {index: 'item_id'});
    for (let i = 0; i < reviewItems.length; i++) {
        let reviewId = reviewItems[i].review_id;
        reviewIdSet.add(reviewId);
    }

    let reviewIdList = [...reviewIdSet];
    if (!dryRun) {
        await r.table('review2item').getAll(r.args(reviewIdList), {index: 'review_id'}).delete();
        await r.table('reviews').getAll(r.args(reviewIdList)).delete();
    }

    return reviewIdList;
}

async function clearAllRemainingLinks(experimentId) {
    let tables = [
        'experiment2datafile',
        'experiment2dataset',
        'experiment2experimentnote',
        'experiment2experimenttask',
        'experiment2process',
        'experiment2sample',
        'project2experiment'
    ];

    for (let i = 0; i < tables.length; i++) {
        let table = tables[i];
        await r.table(table).getAll(experimentId, {index: 'experiment_id'}).delete();
    }
}

module.exports = {
    deleteExperiment: quickDeleteExperiment,
    deleteExperimentFull
};