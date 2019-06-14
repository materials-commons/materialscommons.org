const {Action, api} = require('actionhero');
const dal = require('@dal');
const _ = require('lodash');
const sizeof = require('object-sizeof');

const validObjectTypes = ['project', 'experiment', 'sample', 'process', 'file', 'dataset', 'directory', 'sample_attribute'];
const MAX_METADATA_OBJECT_SIZE = 512;

function validateObjectType(o) {
    let i = _.indexOf(validObjectTypes, o);
    if (i === -1) {
        throw new Error(`object_type must be one of ${validObjectTypes}, got ${o}.`);
    }
}

module.exports.GetMetadataAction = class GetMetadataAction extends Action {
    constructor() {
        super();
        this.name = 'getMetadata';
        this.description = 'Get metadata for an object';
        this.inputs = {
            project_id: {
                required: true
            },

            object_type: {
                required: true,
                validator: param => {
                    validateObjectType(param);
                }
            },

            object_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.objectInProject(params.object_type, params.object_id, params.project_id)) {
            throw new Error(`${params.object_type} with id ${params.object_id} not found in project ${params.project_id}`);
        }

        let o = await dal.tryCatch(async() => await api.mc.metadata.getMetadata(params.object_id, params.object_type));
        if (o === null) {
            throw new Error(`Unable retrieve metadata for object ${params.object_type} with id ${params.object_id}`);
        }

        response.data = o;
    }
};

module.exports.SetMetadataAction = class SetMetadataAction extends Action {
    constructor() {
        super();
        this.name = 'setMetadata';
        this.description = 'Set metadata for an object';
        this.inputs = {
            project_id: {
                required: true
            },

            object_type: {
                required: true,
                validator: param => {
                    validateObjectType(param);
                }
            },

            object_id: {
                required: true,
            },

            metadata: {
                required: true,
                validator: param => {
                    if (_.isArray(param)) {
                        throw new Error(`metadata must be an object, got ${param}`);
                    }

                    if (!_.isPlainObject(param)) {
                        throw new Error(`metadata must be an object, got ${param}`);
                    }

                    if (sizeof(param) > MAX_METADATA_OBJECT_SIZE) {
                        throw new Error('metadata cannot be bigger that 512 bytes');
                    }
                }
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.objectInProject(params.object_type, params.object_id, params.project_id)) {
            throw new Error(`${params.object_type} with id ${params.object_id} not found in project ${params.project_id}`);
        }

        let o = await dal.tryCatch(async() => await api.mc.metadata.setMetadata(params.object_id, params.object_type, params.metadata));
        if (o === null) {
            throw new Error(`Unable set metadata for object ${params.object_type} with id ${params.object_id}`);
        }

        response.data = o;
    }
};