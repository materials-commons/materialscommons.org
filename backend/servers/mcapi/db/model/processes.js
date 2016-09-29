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

    function* deleteProcess(projectId, processId){
        console.log("Backednd low level - delete process: ", projectId, processId);
        let project2process = yield r.table('project2process').filter({project_id:projectId, process_id:processId});
        console.log(project2process.length);
        //Note, because of validation there are no dataset2process records
        let dataset2process = yield r.table('dataset2process').filter({process_id:processId});
        console.log(dataset2process.length);
        // remove project2process records with projectId, and processId
        //   if other records with processId exist, then there are other projects using the project, done!
        // remove experiment2process records with processId
        let experiment2process = yield r.table('experiment2process').filter({process_id:processId});
        console.log(experiment2process.length);
        // remove process2file records with processId
        let process2file = yield r.table('process2file').filter({process_id:processId});
        console.log(process2file.length);
        // remove experimentTask2Process records with processId
        //   for each such experimentTask, if there are no other records, delete experimentsTasks
        let experimentTask2Process = yield r.table('experimenttask2process').filter({process_id:processId});
        console.log(experimentTask2Process.length);
        // remove process2measurement records
        //   for each such measurement, if ther eare no other records, delete measurement
        let process2measurement = yield r.table('process2measurement').filter({process_id:processId});
        console.log(process2measurement.length);
        // remote process2Sample records with proceeeId
        //   for each such sample, if ther eare no other records, delete sample
        let process2Sample = yield r.table('process2sample').filter({process_id:processId});
        console.log(process2Sample.length);
        // remove process2setup records and all setups so linked
        let process2setup = yield r.table('process2setup').filter({process_id:processId});
        console.log(process2setup.length);
    }
};
