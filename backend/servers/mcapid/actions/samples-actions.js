const {Action, api} = require('actionhero');
const dal = require('@dal');
const _ = require('lodash');
const joi = require('joi');

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

module.exports.GetSamplesWithConditionsForProjectAction = class GetSamplesWithConditionsForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getSamplesWithConditionsForProject';
        this.description = 'Returns all samples in the given project';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const samples = await dal.tryCatch(async() => await api.mc.samples.getSamplesWithConditionsForProject(params.project_id));
        if (samples === null) {
            throw new Error(`Unable to retrieve samples for project ${params.project_id}`);
        }
        response.data = samples;
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
                default: [],
                validator: (attrs) => {
                    if (!_.isArray(attrs)) {
                        throw new Error('attributes must be an array');
                    }
                    for (let attr of attrs) {
                        if (!_.isString(attr.name)) {
                            throw new Error(`Attribute must contain a name`);
                        }
                        if (!_.isArray(attr.measurements)) {
                            throw new Error(`Attribute must contain measurements`);
                        }
                        for (let m of attr.measurements) {
                            let results = joi.validate(m, this.measSchema);
                            if (results.error !== null) {
                                throw new Error(`Invalid measurement ${results.error}`);
                            }
                        }
                    }
                }
            }
        };

        this.measSchema = {
            name: joi.string().min(1).max(30),
            value: joi.any(),
            unit: joi.string(),
            otype: joi.string(),
            is_best_measure: joi.boolean(),
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
            let sample2 = await dal.tryCatch(async() => await api.mc.samples.addMeasurementsToSampleInProcess(attributes, sample.id, sample.property_set_id, process_id));

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
            let result = await dal.tryCatch(async() => await api.mc.samples.addMeasurementsToSampleInProcess(attributes, sample.id, sample.property_set_id, process.id));
            if (!result) {
                // addMeasurementsToSampleInProcess returned an error
                api.mc.log.info('addMeasurementsToSampleInProcess failed for attributes', attributes);
            }
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

            return_full_sample: {
                default: true,
            },

            transform: {
                default: false,
            }
        };
    }

    async run({response, params, user}) {
        const {sample_id, property_set_id, process_id, transform} = params;
        const propertySetId = await dal.tryCatch(async() => await api.mc.samples.addSampleToProcess(sample_id, property_set_id, process_id, transform));
        if (!propertySetId) {
            throw new Error(`Unable to add sample ${sample_id}/${property_set_id} to process ${process_id}`);
        }

        let sample;
        if (params.return_full_sample) {
            sample = await dal.tryCatch(async() => await api.mc.samples.getSample(sample_id, user.id));
            if (!sample) {
                throw new Error(`Unable to retrieve sample ${sample_id}`);
            }
        } else {
            sample = await api.mc.samples.getSampleSimple(sample_id);
        }

        sample.property_set_id = propertySetId;

        response.data = sample;
    }
};

module.exports.AddSamplesToProcessAction = class AddSamplesToProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addSamplesToProcess';
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

            samples: {
                required: true,
                validator: param => {
                    if (!_.isArray(param)) {
                        throw new Error('sample parameter must be an array');
                    }
                }
            },

            transform: {
                default: false,
            }
        };
    }

    async run({response, params}) {
        const {samples, process_id, transform} = params;
        const updatedSamples = await dal.tryCatch(async() => await api.mc.samples.addSamplesToProcess(samples, process_id, transform));
        if (updatedSamples === null) {
            throw new Error(`Unable to add samples to process ${process_id}`);
        }

        // add name back to samples and map s.sample_id to s.id, this allows the client to map samples.
        const samplesMap = _.keyBy(samples, 'sample_id');
        api.mc.log.info('samplesMap', samplesMap);
        updatedSamples.forEach(s => {
            api.mc.log.info('s', s);
            let sampleWithName = samplesMap[s.sample_id];
            s.name = sampleWithName.name;
            s.id = s.sample_id;
        });

        response.data = updatedSamples;
    }
};

module.exports.AddSampleAndFilesToProcessAction = class AddSampleAndFilesToProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addSampleAndFilesToProcess';
        this.description = 'Add sample and files to process. Connect files to process and sample. Optionally create a new attribute set.';
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
            },

            files_by_name: {
                default: [],
            },

            files_by_id: {
                default: [],
            }
        };
    }

    async run({response, params, user}) {
        const {sample_id, property_set_id, process_id, transform} = params;
        const propertySetId = await dal.tryCatch(async() => await api.mc.samples.addSampleToProcess(sample_id, property_set_id, process_id, transform));
        if (!propertySetId) {
            throw new Error(`Unable to add sample ${sample_id}/${property_set_id} to process ${process_id}`);
        }

        if (params.files_by_name.length) {
            const result = await dal.tryCatch(async() => api.mc.samples.linkFilesByNameToProcessAndSample(params.files_by_name, process_id, sample_id));
            if (!result) {
                throw new Error(`Unable to link files to process ${process_id} and sample ${sample_id}`);
            }
        }

        if (params.files_by_id.length) {
            const result = await dal.tryCatch(async() => api.mc.samples.linkFilesByIdToProcessAndSample(params.files_by_id, process_id, sample_id));
            if (!result) {
                throw new Error(`Unable to link files to process ${process_id} and sample ${sample_id}`);
            }
        }

        const sample = await dal.tryCatch(async() => await api.mc.samples.getSample(sample_id, user.id));
        if (!sample) {
            throw new Error(`Unable to retrieve sample ${sample_id}`);
        }

        sample.property_set_id = propertySetId;

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

            sample_id: {
                required: true,
            },

            property_set_id: {
                required: true,
            },

            return_full_sample: {
                default: true,
            },

            attributes: {

                /*
                An attribute looks as follows:
                {
                   name,
                   id (optional),
                   measurements:[
                       {
                          value,
                          unit,
                          otype,
                          is_best_measure
                       }
                   ]
                }
                 */
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error('attributes must be an array');
                    }
                }
            }
        };
    }

    async run({response, params, user}) {
        const {sample_id, property_set_id, process_id, attributes} = params;
        const result = await dal.tryCatch(async() => await api.mc.samples.addMeasurementsToSampleInProcess(attributes, sample_id, property_set_id, process_id));
        if (!result) {
            throw new Error(`Unable to add measurements to sample ${sample_id}/${property_set_id} in process ${process_id}`);
        }

        let sample;
        if (params.return_full_sample) {
            sample = await dal.tryCatch(async() => await api.mc.samples.getSample(sample_id, user.id));
            if (!sample) {
                throw new Error(`Unable to retrieve sample ${sample_id}`);
            }
        } else {
            sample = {
                id: sample_id,
            };
        }

        sample.property_set_id = property_set_id;

        response.data = sample;
    }
};

const sampleExample = {};
