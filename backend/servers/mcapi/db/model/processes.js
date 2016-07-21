module.exports = function(r) {
    const dbExec = require('./run');
    const commonQueries = require('./common-queries');
    const processCommon = require('./process-common')(r);

    return {
        getProcess,
        getProjectProcesses,
        getProcessTemplates,
        createProcessFromTemplate,
        processTemplateExists,
        updateProcess,
        r: r
    };

    function* getProcess(processID) {
        let rql = commonQueries.processDetailsRql(r.table('processes').getAll(processID), r);
        let process = yield dbExec(rql);
        return process.length ? {val: process[0]} : {error: `No such process ${processID}`};
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

    function* createProcessFromTemplate(projectId, templateId, owner) {
        let template = yield r.table('templates').get(templateId);
        let procId = yield processCommon.createProcessFromTemplate(projectId, template, owner);
        return yield getProcess(procId);
    }

    function* processTemplateExists(templateId) {
        let templates = yield r.table('templates').getAll(templateId);
        return templates.length !== 0;
    }

    function* updateProcess(processId, properties, files, samples) {
        if (properties) {
            let errors = yield processCommon.updateProperties(properties);
            if (errors !== null) {
                return {error: errors};
            }
        }

        if (files) {
            let errors = yield processCommon.updateProcessFiles(processId, files);
            if (errors !== null) {
                return {error: errors};
            }
        }

        if (samples) {
            let errors = yield processCommon.updateProcessSamples(processId, samples);
            if (errors !== null) {
                return {error: errors};
            }
        }

        return yield getProcess(processId);
    }
};
