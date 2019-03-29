const {Action, api} = require('actionhero');
const dal = require('@dal');
const _ = require('lodash');

module.exports.GetSamplesForProjectAction = class GetSamplesForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getSamplesForProject';
        this.description = 'Returns all samples in the given project';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
        this.outputExample = sampleExample;
    }

    async run({response, params}) {
        let results = await dal.tryCatch(async() => await api.mc.samples.getSamplesForProject(params.project_id));
        if (results === null) {
            throw new Error(`Unable to retrieve samples for project ${params.project_id}`);
        }
        response.data = results;
    }
};

module.exports.GetSampleAction = class GetSampleAction extends Action {
    constructor() {
        super();
        this.name = 'getSample';
        this.description = 'Returns the given sample';
        this.inputs = {
            sample_id: {
                required: true,
            }
        };
        this.outputExample = {};
    }

    async run({response, params, user}) {
        const results = await dal.tryCatch(async() => await api.mc.samples.getSample(params.sample_id, user.id));
        if (!results) {
            throw new Error(`Unable to retrieve samples ${params.sample_id}`);
        }
        response.data = results;
    }
};

module.exports.CreateSampleInProcessAction = class CreateSampleInProcessAction extends Action {
    constructor() {
        super();
        this.name = 'createSampleInProcess';
        this.description = 'Creates a new sample in the given process';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            name: {
                required: true,
            },

            description: {
                required: true,
            },

            attributes: {
                /*
                An attribute looks as follows:
                {
                   name,
                   measurements:[
                       {
                          name,
                          attribute,
                          value,
                          unit,
                          otype,
                          is_best_measure
                       }
                   ]
                }
                 */
                default: [],
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error('attributes must be an array');
                    }
                }
            }
        };
    }

    async run({response, params, user}) {
        const {project_id, experiment_id, process_id, name, description, attributes} = params;
        let sample = await dal.tryCatch(async() => await api.mc.samples.createSampleInProcess(name, description, user.id, process_id, project_id));
        if (!sample) {
            throw new Error(`Unable to create sample ${name} for process ${process_id} in project ${project_id}/experiment ${experiment_id}`);
        }

        await api.mc.samples.addSampleToExperiment(sample.id, experiment_id);

        if (attributes.length !== 0) {
            let sample2 = await dal.tryCatch(async() => await api.mc.samples.addAttributesToSampleInProcess(attributes, sample.id, process_id));

            // Adding the attributes changes what we return for the sample. If adding the attributes failed, but we did successfully create the
            // sample then this is a partial failure condition. In this case its not clear what the user would consider the correct thing to do.
            // So, if there is a failure we return the sample to this point and indicate a failure condition to the user.
            if (sample2 !== null) {
                sample = sample2;
            } else {
                api.mc.log.info(`Unable to add attributes to sample ${name}/${sample.id}`);
                sample.error = `Unable to add attributes to sample`;
            }
        }

        response.data = sample;
    }
};

module.exports.CreateSampleAction = class CreateSampleAction extends Action {
    constructor() {
        super();
        this.name = 'createSample';
        this.description = 'Creates a new sample';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            name: {
                required: true,
            },

            description: {
                default: '',
            },

            attributes: {
                default: [],
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error('attributes must be an array');
                    }
                }
            }
        };
    }

    async run({response, params, user}) {
        const {project_id, experiment_id, name, description, attributes} = params;

        let process = await dal.tryCatch(async() => await api.mc.processes.createProcess(project_id, experiment_id, 'Create Samples', user.id, []));
        if (!process) {
            throw new Error(`Unable to create process to add sample ${name} to`);
        }

        let sample = await dal.tryCatch(async() => await api.mc.samples.createSampleInProcess(name, description, user.id, process.id, project_id));

        if (!sample) {
            throw new Error(`Unable to create sample ${name} in project ${project_id}/experiment ${experiment_id}`);
        }

        await api.mc.samples.addSampleToExperiment(sample.id, experiment_id);

        if (attributes.length !== 0) {
            sample = await dal.tryCatch(async() => await api.mc.samples.addAttributesToSampleInProcess(attributes, sample.id, process.id));
        }

        response.data = sample;
    }
};

module.exports.AddSampleToProcessAction = class AddSampleToProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addSampleToProcess';
        this.description = 'Add sample to process. Optionally create a new attribute set.';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            sample_id: {
                required: true,
            },

            property_set_id: {
                required: true,
            },

            transform: {
                default: false,
            }
        };
    }

    async run({response, params}) {
        const {sample_id, property_set_id, process_id, transform} = params;
        const sample = await dal.tryCatch(async() => await api.mc.samples.addSampleToProcess(sample_id, property_set_id, process_id, transform));
        if (!sample) {
            throw new Error(`Unable to add sample ${sample_id}/${property_set_id} to process ${process_id}`);
        }

        response.data = sample;
    }
};

module.exports.AddMeasurementsToSampleInProcessAction = class AddMeasurementsToSampleInProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addMeasurementsToSampleInProcess';
        this.description = 'Adds measurements to the sample in the process';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            attributes: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error('attributes must be an array');
                    }
                }
            }
        };
    }

    async run({response, params}) {
        const {sample_id, property_set_id, process_id, attributes} = params;
        const sample = await dal.tryCatch(async() => await api.mc.samples.addMeasurementsToSampleInProcess(attributes, sample_id, property_set_id, process_id));
        if (!sample) {
            throw new Error(`Unable to add measurements to sample ${sample_id}/${property_set_id} in process ${process_id}`);
        }

        response.data = sample;
    }
};

const sampleExample = {};