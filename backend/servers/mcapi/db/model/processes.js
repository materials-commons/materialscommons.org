module.exports = function(r) {
    const dbExec = require('./run');
    const commonQueries = require('../../../lib/common-queries');
    const processCommon = require('./process-common')(r);

    return {
        getProcess,
        getProjectProcesses,
        getProcessTemplates,
        createProcessFromTemplate,
        processTemplateExists,
        updateProcess,
        deleteProcess,
        datasetsForProcess,
        getTemplate,
        r: r
    };

    function* getProcess(processID) {
        return yield processCommon.getProcess(processID);
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

    function* processTemplateExists(templateId) {
        let templates = yield r.table('templates').getAll(templateId);
        return templates.length !== 0;
    }

    function* updateProcess(processId, updateArgs) {
        if (updateArgs.properties) {
            let errors = yield processCommon.updateProperties(properties);
            if (errors !== null) {
                return {error: errors};
            }
        }

        if (updateArgs.files) {
            let errors = yield processCommon.updateProcessFiles(processId, files);
            if (errors !== null) {
                return {error: errors};
            }
        }

        if (updateArgs.samples) {
            let errors = yield processCommon.updateProcessSamples(processId, samples);
            if (errors !== null) {
                return {error: errors};
            }
        }

        if (updateArgs.name) {
            yield r.table('processes').get(processId).update({name: updateArgs.name});
        }

        return yield getProcess(processId);
    }

    function* datasetsForProcess(processId) {
        let dataset2process = yield r.table('dataset2process').filter({process_id:processId}).coerceTo('array');
        if (dataset2process.length == 0) return [];
        let datasetIdValues = dataset2process.map(record => record.dataset_id);
        console.log("DatasetsForProcess: ",datasetIdValues);
        return yield r.expr(datasetIdValues).map(r.db('materialscommons').table('datasets').get(r.row)).coerceTo('array');
    }

    function* deleteProcess(projectId, processId){
        var i;
        console.log('-----------------------------------------------------------------------------------');
        console.log("Backednd low level - delete process: ", projectId, processId);

        // remove project2process records with projectId, and processId
        let project2processDeleted = yield r.table('project2process').filter({project_id:projectId, process_id:processId}).delete();
        console.log('project2processDeleted',project2processDeleted);

        // if other records with processId exist, then there are other projects using the project, done!
        let project2processOther = yield r.table('project2process').filter({process_id:processId});
        if (project2processOther.length == 0) {
            // remove experiment2process records with processId
            let experiment2processDelete = yield r.table('experiment2process').filter({process_id:processId}).delete();
            console.log('experiment2processDelete',experiment2processDelete);

            // remove process2file records with processId
            let process2fileDelete = yield r.table('process2file').filter({process_id:processId}).delete();
            console.log('process2fileDelete',process2fileDelete);

            // remove experimentTask2Process records with processId
            //   for each such experimentTask, if there are no other records, delete experimentsTasks
            let experimenttask2process = yield r.table('experimenttask2process').filter({process_id:processId});
            console.log('experimenttask2Process',experimenttask2process.length);
            let experimentTaskIdValues = experimenttask2process.map(record => record.experimentaltask_id);
            console.log('experimentTaskIdValues',experimentTaskIdValues);
            if (experimentTaskIdValues) {
                for (i = 0; i < experimentTaskIdValues.length; i++) {
                    let id = experimentTaskIdValues[i];
                    console.log('experimentTaskIdValues: id',id);
                    let hits = yield r.table('experimenttask2process').filter({experimentaltask_id:id});
                    console.log('experimentTaskIdValues: hits',hits);
                    if (!hits) {
                        let del = yield r.table('experimenttasks').get(id).delete();
                        console.log('experimentTaskIdValues: del',del);
                    }
                }
            }

            // remove process2measurement records
            //   for each such measurement, if ther eare no other records, delete measurement
            let process2measurement = yield r.table('process2measurement').filter({process_id:processId});
            console.log('process2measurement',process2measurement.length);
            let measurementIdValues = process2measurement.map(record => record.measurement_id);
            console.log('measurementIdValues',measurementIdValues);
            if (measurementIdValues) {
                for (i = 0; i < measurementIdValues.length; i++) {
                    let id = measurementIdValues[i];
                    console.log('measurementIdValues: id',id);
                    let hits = yield r.table('process2measurement').filter({measurement_id:id});
                    console.log('measurementIdValues: hits',hits);
                    if (!hits) {
                        let del = yield r.table('measurements').get(id).delete();
                        console.log('measurementIdValues: del',del);
                    }
                }
            }

            // remote process2Sample records with proceeeId
            //   for each such sample, if ther eare no other records, delete sample
            let process2Sample = yield r.table('process2sample').filter({process_id:processId});
            console.log('process2Sample',process2Sample.length);
            let sampleIdValues = process2Sample.map(record => record.sample_id);
            console.log('sampleIdValues',sampleIdValues);
            if (sampleIdValues) {
                for (i = 0; i < sampleIdValues.length; i++) {
                    let id = sampleIdValues[i];
                    console.log('sampleIdValues: id',id);
                    let hits = yield r.table('process2sample').filter({sample_id:id});
                    console.log('sampleIdValues: hits',hits);
                    if (!hits) {
                        let del = yield r.table('samples').get(id).delete();
                        console.log('sampleIdValues: del',del);
                    }
                }
            }

            // remove process2setup records and all setups so linked
            let process2setup = yield r.table('process2setup').filter({process_id:processId});
            console.log('process2setup',process2setup);
            let setupIdValues = process2setup.map(record => record.setup_id);
            console.log('setupIdValues',setupIdValues);
            if (setupIdValues) {
                for (i = 0; i < setupIdValues.length; i++) {
                    let id = setupIdValues[i];
                    console.log('setupIdValues: id',id);
                    let del = yield r.table('setups').get(id).delete();
                    console.log('setupIdValues: del',del);
                }
            }

        }
        console.log('-----------------------------------------------------------------------------------');
        return {val: "Process Deleted"}
    }
};
