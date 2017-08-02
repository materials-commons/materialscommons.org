const r = require('../r');
const dbExec = require('./run');
const commonQueries = require('../../../lib/common-queries');
const processCommon = require('./process-common');

function* getProcess(processID) {
    return yield processCommon.getProcess(r, processID);
}

function* getProjectProcesses(projectID) {
    let rql = commonQueries.processDetailsRql(r.table('project2process').getAll(projectID, {index: 'project_id'})
        .eqJoin('process_id', r.table('processes')).zip().filter(r.row('process_type').ne('as_received')), r);
    let processes = yield dbExec(rql);
    return {val: processes};
}

function* getProcessTemplates() {
    let templates = yield r.table('templates');
    return {val: templates};
}

function* getTemplate(templateId) {
    let rql = r.table('templates').get(templateId);
    return yield dbExec(rql);
}

function* createProcessFromTemplate(projectId, templateId, owner) {
    let template = yield r.table('templates').get(templateId);
    let procId = yield processCommon.createProcessFromTemplate(projectId, template, owner);
    return yield getProcess(procId);
}

function* updateProcess(processId, updateArgs) {
    if (updateArgs.properties.length) {
        let errors = yield processCommon.updateProperties(updateArgs.properties);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.files.length) {
        let errors = yield processCommon.updateProcessFiles(processId, updateArgs.files);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.samples.length) {
        let process = yield r.table('processes').get(processId);
        let errors = yield processCommon.updateProcessSamples(process, updateArgs.samples);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.name) {
        yield r.table('processes').get(processId).update({name: updateArgs.name});
    }

    if (updateArgs.description) {
        yield r.table('processes').get(processId).update({description: updateArgs.description});
    }

    return yield getProcess(processId);
}

function* datasetsForProcess(processId) {
    let dataset2process = yield r.table('dataset2process').filter({process_id: processId}).coerceTo('array');
    if (dataset2process.length === 0) {
        return [];
    }
    let datasetIdValues = dataset2process.map(record => record.dataset_id);
    return yield r.expr(datasetIdValues).map(r.db('materialscommons').table('datasets').get(r.row)).coerceTo('array');
}

function* deleteProcess(projectId, processId, options) {
    let forceDelete = false;
    if (options && options.force) forceDelete = true;

    let i;

    if (!forceDelete) {
        // can not delete a process that is in a dataset
        let dataset2process = yield r.table('dataset2process').getAll(processId, {index: 'process_id'});
        if (dataset2process.length > 0) {
            return {error: "Can not delete a process that is in a dataset: remove process from dataset(s)"}
        }

        // can not delete a process that is a non-leaf node in a workflow;
        // a process a non-leaf node if it has any 'out' sample that is an 'in' sample elsewhere
        let joinRecords = yield r.table('process2sample').getAll(processId, {index: 'process_id'})
            .eqJoin('sample_id', r.db('materialscommons').table('process2sample'), {index: 'sample_id'})
            .map({
                "p1": r.row("left")("process_id"),
                "d1": r.row("left")("direction"),
                "p2": r.row("right")("process_id"),
                "d2": r.row("right")("direction"),
                "sample_id": r.row("right")("sample_id")
            }).filter({'d1': 'out'}).filter({'d2': 'in'});
        for (i = 0; i < joinRecords.length; i++) {
            let record = joinRecords[i];
            if (record.p1 != record.p2) {
                return {
                    error: "Can not delete a process, "
                    + processId
                    + ", that is not the leaf node of a workflow; delete other processes first"
                }
            }
        }
    }

    try {
        // remove project2process records with projectId, and processId
        yield r.table('project2process').getAll([projectId, processId], {index: 'project_process'}).delete();

        // if other records with processId exist, then there are other projects using the process, done!
        let project2processOther = yield r.table('project2process').filter({process_id: processId});
        if (project2processOther.length === 0) {
            // remove experiment2process records with processId
            yield r.table('experiment2process').filter({process_id: processId}).delete();

            // remove process2file records with processId
            yield r.table('process2file').filter({process_id: processId}).delete();

            // remove experimentTask2Process records with processId
            //   for each such experimentTask, if there are no other records, delete experimentsTasks
            let experimenttask2process = yield r.table('experimenttask2process').filter({process_id: processId});
            let experimentTaskIdValues = experimenttask2process.map(record => record.experimentaltask_id);
            yield r.table('experimenttask2process').filter({process_id: processId}).delete();
            if (experimentTaskIdValues) {
                for (i = 0; i < experimentTaskIdValues.length; i++) {
                    let id = experimentTaskIdValues[i];
                    let hits = yield r.table('experimenttask2process').filter({experimentaltask_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        yield r.table('experimenttasks').get(id).delete();
                    }
                }
            }

            // remove process2measurement records
            //   for each such measurement, if there are no other records, delete measurement
            let process2measurement = yield r.table('process2measurement').filter({process_id: processId});
            let measurementIdValues = process2measurement.map(record => record.measurement_id);
            yield r.table('process2measurement').filter({process_id: processId}).delete();
            if (measurementIdValues) {
                for (i = 0; i < measurementIdValues.length; i++) {
                    let id = measurementIdValues[i];
                    let hits = yield r.table('process2measurement').filter({measurement_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        yield r.table('measurements').get(id).delete();
                    }
                }
            }

            // remote process2Sample records with processId
            //   for each such sample, if there are no other records, delete sample
            let process2Sample = yield r.table('process2sample').filter({process_id: processId});
            let sampleIdValues = process2Sample.map(record => record.sample_id);
            yield r.table('process2sample').filter({process_id: processId}).delete();
            if (sampleIdValues) {
                for (i = 0; i < sampleIdValues.length; i++) {
                    let id = sampleIdValues[i];
                    let hits = yield r.table('process2sample').filter({sample_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        yield r.table('samples').get(id).delete();
                    }
                }
            }

            // remove process2setup records and all setups so linked
            let process2setup = yield r.table('process2setup').filter({process_id: processId});
            let setupIdValues = process2setup.map(record => record.setup_id);
            if (setupIdValues) {
                for (i = 0; i < setupIdValues.length; i++) {
                    let id = setupIdValues[i];
                    yield r.table('setups').get(id).delete();
                }
            }
        }
    } catch (error) {
        return {error: error};
    }

    return {val: "Process Deleted"};
}

function* createProcessTemplate(template, owner) {
    let rv = {};

    template.owner = owner;

    let results = yield r.table('templates').insert(template);
    if (results.errors) {
        rv.error = `Template ${template.id} already exists`;
    } else {
        rv.val = yield getTemplate(template.id);
    }
    return rv;
}

function* updateExistingTemplate(template_id, template) {
    let rv = {};
    yield r.table('templates').get(template_id).update(template);
    rv.val = yield getTemplate(template_id);
    return rv;
}

module.exports = {
    getProcess,
    getProjectProcesses,
    getProcessTemplates,
    createProcessFromTemplate,
    updateProcess,
    deleteProcess,
    datasetsForProcess,
    getTemplate,
    createProcessTemplate,
    updateExistingTemplate
};
