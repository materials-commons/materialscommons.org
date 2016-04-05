module.exports = function(model) {
    const Schema = require('js-data-schema');
    const schema = new Schema();

    let schemaRules = require('./schema-rules')(model);
    //let dataTypes = require('./schema-data-types');
    defineRules();

    let directorySchema = require('./directory-schema')(schema);
    let experimentSchema = require('./experiment-schema')(schema);
    let samplesSchema = require('./samples-schema')(schema);
    let processSchema = require('./process-schema')(schema);
    let measurementsSchema = require('./measurements-schema')(schema);

    return {
        samples: samplesSchema.defineSamplesSchema(),
        transformedSamples: samplesSchema.defineTransformedSamplesSchema(),
        processes: processSchema.defineProcessSchema(),
        measurements: measurementsSchema.defineMeasurementsSchema(),
        createDirectory: directorySchema.defineCreateDirectorySchema(),
        renameDirectory: directorySchema.defineRenameDirectorySchema(),
        moveDirectory: directorySchema.defineMoveDirectorySchema(),
        createExperiment: experimentSchema.defineCreateExperimentSchema(),
        updateExperiment: experimentSchema.defineUpdateExperimentSchema(),
        createExperimentStep: experimentSchema.defineCreateExperimentStepSchema(),
        updateExperimentStep: experimentSchema.defineUpdateExperimentStepSchema(),
        validate,
        prepare,
        model: model
    };

    function validate(schema, body) {
        return schema.validateAsync(body).then(() => null, (errors) => errors);
    }

    function prepare(schema, body) {
        schema.stripNonSchemaAttrs(body);
        schema.addDefaultsToTarget(body);
    }

    /////////////// Define Rules ///////////////

    function defineRules() {
        schema.defineRule('mustExist', schemaRules.mustExist, true);
        schema.defineRule('mustNotExist', schemaRules.mustNotExist, true);
        schema.defineRule('mustNotExistInProject', schemaRules.mustNotExistInProject, true);
        schema.defineRule('mustExistInProject', schemaRules.mustExistInProject, true);
        schema.defineRule('mustBeForSample', schemaRules.mustBeForSample, true);
        schema.defineRule('mustBeForAttributeSet', schemaRules.mustBeForAttributeSet, true);
        schema.defineRule('mustBeValidMeasurements', schemaRules.mustBeValidMeasurements, true);
        schema.defineRule('isValidPropertyType', schemaRules.isValidPropertyType);
        schema.defineRule('isValidUnit', schemaRules.isValidUnit);
        schema.defineRule('isValidExperimentStatus', schemaRules.isValidExperimentStatus);
        schema.defineRule('oneOf', schemaRules.oneOf);
        schema.defineRule('mustNotStartWith', schemaRules.mustNotStartWith);
        schema.defineRule('mustNotExistInDirectory', schemaRules.mustNotExistInDirectory, true);
        schema.defineRule('mustNotExistInParentDirectory', schemaRules.mustNotExistInParentDirectory, true);
    }
};
