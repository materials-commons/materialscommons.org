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
};
