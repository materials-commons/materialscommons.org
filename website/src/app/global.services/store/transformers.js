function transformProject(project) {
    let p = project;
    p.experimentsFullyLoaded = false;
    p.experiments = _.indexBy(project.experiments, 'id');
    p.samples = _.indexBy(project.samples, 'id');
    return p;
}

function transformExperiment(experiment) {
    let e = experiment;

    if (e.processes) {
        e.processes = _.indexBy(experiment.processes, 'id');
    }

    if (e.samples) {
        e.samples = _.indexBy(experiment.samples, 'id');
    }

    e.cy = null;

    _transformTasks(e.tasks);

    return e;
}

function _transformTasks(tasks) {
    tasks.forEach(t => _toUITask(t));
}

function _toUITask(task) {
    task.displayState = {
        details: {
            showNotes: true,
            showFiles: false,
            showSamples: false,
            currentFilesTab: 0,
            currentSamplesTab: 0,
            loadEditor: false
        },
        flags: {
            starredClass: task.flags.starred ? 'fa-star' : 'fa-star-o',
            flaggedClass: task.flags.flagged ? 'mc-flagged-color' : 'mc-flag-not-set'
        },
        selectedClass: '',
        editTitle: true,
        open: false,
        maximize: false
    };
    task.loaded = false;
    task.node = null;
}

function transformProcess(process) {
    let p = process;
    p.input_samples = _.indexBy(process.input_samples, 'id');
    p.output_samples = _.indexBy(process.output_samples, 'id');
    return p;
}

function transformSample(sample) {
    // no transform for now
    return sample;
}

const transformers = {
    transformProject,
    transformExperiment,
    transformProcess,
    transformSample
};

export default transformers;