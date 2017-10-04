const helper = require('./build-demo-project-helper');
const demoConfig = require('./build-demo-project-conf');

function* findOrBuildAllParts(user, datapathPrefix) {
    let project = null;
    let experiment = null;
    let processes = null;
    let samples = null;
    let files = null;

    let ret = yield helper.createOrFindDemoProjectForUser(user);

    if (!ret.error) {
        project = ret.val;
        ret = yield helper.createOrFindDemoProjectExperiment(project);
    }

    if (!ret.error) {
        experiment = ret.val;
        ret = yield helper.createOrFindAllDemoProcesses(project, experiment);
    }
    if (!ret.error) {
        processes = ret.val;
        ret = yield helper.createOrFindOutputSamplesForAllProcesses(
            project, experiment, processes, demoConfig.sampleNameData, demoConfig.outputSampleIndexMap);
    }

    if (!ret.error) {
        samples = ret.val;
        ret = yield helper.createOrFindInputSamplesForAllProcesses(
            project, experiment, processes, samples, demoConfig.inputSampleIndexMap);
    }

    if (!ret.error) {
        // Note: refresh process list. If they were created for the first time on the above call, then the
        // body of the returned process is not sufficently decorated to support inserting properties;
        // however, on refresh it is. Needs to be investigated.
        ret = yield helper.createOrFindAllDemoProcesses(project, experiment);
    }

    if (!ret.error) {
        processes = ret.val;
        ret = yield helper.createOrFindSetupPropertiesForAllDemoProcesses(project, experiment, processes);
    }

    if (!ret.error) {
        // Note: special case, in this instance only one process with measurements
        let process = processes[0];
        let processData = demoConfig.processesData[0];
        let measurement = processData.measurements[0];

        ret = yield helper.updateMeasurementForProcessSamples(process, measurement);
    }

    if (!ret.error) {
        yield helper.addAllFilesToProject(user, project, datapathPrefix);
        files = yield helper.filesForProject(project);
        ret = yield helper.createOrFindAllDemoProcesses(project, experiment);
    }

    if (!ret.error) {
        processes = ret.val;
        ret = yield helper.addAllFilesToExperimentProcesses(project, experiment, processes, files);
    }

    if (!ret.error) {
        let processes = ret.val;
        ret.val = {
            project: project,
            experiment: experiment,
            processes: processes,
            samples: samples,
            files: files
        };
    }
    return ret;
}

module.exports = {
    findOrBuildAllParts
};