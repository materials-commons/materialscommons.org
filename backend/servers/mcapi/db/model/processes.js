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
        let dataset2process = yield r.table('dataset2process').filter({process_id: processId}).coerceTo('array');
        if (dataset2process.length == 0) return [];
        let datasetIdValues = dataset2process.map(record => record.dataset_id);
        return yield r.expr(datasetIdValues).map(r.db('materialscommons').table('datasets').get(r.row)).coerceTo('array');
    }

    function* deleteProcess(projectId, processId) {
        var i;

        try {
            // remove project2process records with projectId, and processId
            yield r.table('project2process').getAll([projectId, processId], {index: 'project_process'}).delete();

            // if other records with processId exist, then there are other projects using the project, done!
            let project2processOther = yield r.table('project2process').filter({process_id: processId});
            if (project2processOther.length == 0) {
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
                        if (!hits || (hits && (hits.length == 0))) {
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
                        if (!hits || (hits && (hits.length == 0))) {
                            yield r.table('measurements').get(id).delete();
                        }
                    }
                }

                // remote process2Sample records with proceeeId
                //   for each such sample, if there are no other records, delete sample
                let process2Sample = yield r.table('process2sample').filter({process_id: processId});
                let sampleIdValues = process2Sample.map(record => record.sample_id);
                yield r.table('process2sample').filter({process_id: processId}).delete();
                if (sampleIdValues) {
                    for (i = 0; i < sampleIdValues.length; i++) {
                        let id = sampleIdValues[i];
                        let hits = yield r.table('process2sample').filter({sample_id: id});
                        if (!hits || (hits && (hits.length == 0))) {
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

};
