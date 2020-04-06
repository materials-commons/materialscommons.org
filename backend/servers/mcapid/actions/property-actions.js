const {Action, api} = require('actionhero');
const dal = require('@dal');
const {isReadonly} = require('@lib/readonly');

module.exports.GetPropertyMeasurementsAction = class GetPropertyMeasurementsAction extends Action {
    constructor() {
        super();
        this.name = 'getPropertyMeasurements';
        this.description = 'Get meassurements for property';
        this.inputs = {
            property_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        let p = await dal.tryCatch(async() => await api.mc.properties.getPropertyMeasurements(params.property_id));
        if (!p) {
            throw new Error(`Unable to retrieve measurements for property ${params.property_id}`);
        }

        response.data = p;
    }
};

module.exports.SetAsBestMeasureAction = class SetAsBestMeasureAction extends Action {
    constructor() {
        super();
        this.name = 'setAsBestMeasure';
        this.description = 'Set measurement as best measure';
        this.inputs = {
            property_id: {
                required: true,
            },

            measurement_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (isReadonly(user)) {
            throw new Error(`Only read operations are allowed`);
        }

        let status = await dal.tryCatch(async() => await api.mc.samples.addAsBestMeasure(params.property_id, params.measurement_id));
        if (!status) {
            throw new Error(`Unable to set measurement ${params.measurement_id} for attribute ${params.property_id} as best measure.`);
        }

        response.data = {success: true};
    }
};

module.exports.ClearBestMeasureAction = class ClearBestMeasureAction extends Action {
    constructor() {
        super();
        this.name = 'clearBestMeasure';
        this.description = 'Clear best measure for the attribute';
        this.inputs = {
            property_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (isReadonly(user)) {
            throw new Error(`Only read operations are allowed`);
        }

        let status = await dal.tryCatch(async() => await api.mc.properties.clearBestMeasureForProperty(params.property_id));

        if (!status) {
            throw new Error(`Unable to clear best measure for attribute ${params.property_id}.`);
        }

        response.data = {success: true};
    }
};