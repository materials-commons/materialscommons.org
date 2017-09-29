function projectTransformer(project) {
    let p = project;
    p.experiments = _.indexBy(project.experiments, 'id');
    p.samples = _.indexBy(project.samples, 'id');
    return p;
}

function experimentTransformer(experiment) {
    let e = experiment;
    e.processes = _.indexBy(experiment.processes, 'id');
    e.samples = _.indexBy(experiment.samples, 'id');
    e.cy = null;
}

function processTransformer(process) {
    let p = process;
    p.input_samples = _.indexBy(process.input_samples, 'id');
    p.output_samples = _.indexBy(process.output_samples, 'id');
}

function sampleTransformer(sample) {
    // no transform for now
    return sample;
}

const transformers = {
    projectTransformer,
    experimentTransformer,
    processTransformer,
    sampleTransformer
};

export default transformers;