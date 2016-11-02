const Schema = require('js-data-schema');
const schema = new Schema();

let schemaRules = require('./schema-rules');
//let dataTypes = require('./schema-data-types');
defineRules();

let directorySchema = require('./directory-schema')(schema);
let experimentSchema = require('./experiment-schema')(schema);
let samplesSchema = require('./samples-schema')(schema);
let processSchema = require('./process-schema')(schema);
let userSchema = require('./user-schema')(schema);
let datasetSchema = require('./dataset-schema')(schema);

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

const createSamples = samplesSchema.defineCreateSamplesSchema();
const addSamplesMeasurements = samplesSchema.defineAddSamplesMeasurementsSchema();
const samplesMeasurement = samplesSchema.defineSamplesMeasurementSchema();
const measurement = samplesSchema.defineMeasurementSchema();
const processes = processSchema.defineCreateProcessSchema();
const updateProcess = processSchema.defineUpdateProcessSchema();
const createDirectory = directorySchema.defineCreateDirectorySchema();
const renameDirectory = directorySchema.defineRenameDirectorySchema();
const moveDirectory = directorySchema.defineMoveDirectorySchema();
const createExperiment = experimentSchema.defineCreateExperimentSchema();
const updateExperiment = experimentSchema.defineUpdateExperimentSchema();
const createExperimentTask = experimentSchema.defineCreateExperimentTaskSchema();
const updateExperimentTask = experimentSchema.defineUpdateExperimentTaskSchema();
const createExperimentNote = experimentSchema.defineCreateExperimentNoteSchema();
const updateExperimentNote = experimentSchema.defineUpdateExperimentNoteSchema();
const updateExperimentTaskTemplateProps = experimentSchema.defineUpdateExperimentTaskTemplatePropsSchema();
const templateProperty = experimentSchema.defineTemplatePropertySchema();
const templateCommand = experimentSchema.defineTemplateCommandSchema();
const userAccountSchema = userSchema.defineUserAccountSchema();
const createDatasetSchema = datasetSchema.defineCreateDatasetSchema();
const updateDatasetSchema = datasetSchema.defineUpdateDatasetSchema();
const datasetAuthor = datasetSchema.defineDatasetAuthorSchema();
const datasetPaper = datasetSchema.defineDatasetPaperSchema();

module.exports = {
    createSamples,
    addSamplesMeasurements,
    samplesMeasurement,
    measurement,
    processes,
    updateProcess,
    //measurements: measurementsSchema.defineMeasurementsSchema(),
    createDirectory,
    renameDirectory,
    moveDirectory,
    createExperiment,
    updateExperiment,
    createExperimentTask,
    updateExperimentTask,
    createExperimentNote,
    updateExperimentNote,
    updateExperimentTaskTemplateProps,
    templateProperty,
    templateCommand,
    userAccountSchema,
    createDatasetSchema,
    updateDatasetSchema,
    datasetAuthor,
    datasetPaper,
    validate,
    prepare
};
