const check = require('../../../db/model/check');
const schema = require('../../../schema');
const propertyValidator = require('../../../schema/property-validator');

function* validateSample(projectId, sample) {
    schema.prepare(schema.templateCommand, sample);
    let errors = yield schema.validate(schema.templateCommand, sample);
    if (errors !== null) {
        return errors;
    }

    if (sample.command !== 'add' && sample.command !== 'delete') {
        return {error: `Bad command '${sample.command} for file ${sample.id}`}
    }

    if (sample.property_set_id === '') {
        return {error: `A valid property set must be supplied`};
    }

    let sampleInProject = yield check.sampleInProject(projectId, sample.id);
    if (!sampleInProject) {
        return {error: `Sample ${sample.id} not in project ${projectId}`}
    }

    let sampleHasPropertySet = yield check.sampleHasPropertySet(sample.id, sample.property_set_id);
    if (!sampleHasPropertySet) {
        return {error: `Sample ${sample.id} doesn't have property set ${sample.property_set_id}`};
    }

    return null;
}

function* validateProperty (template, property) {
    let errors = yield schema.validate(schema.templateProperty, property);
    if (errors !== null) {
        return errors;
    }


    if (!propertyValidator.isValidSetupProperty(template, property)) {
        return {error: `Invalid property ${property.attribute}`};
    }

    return null;
}

function* validateFile (projectId, file) {
    let errors = yield schema.validate(schema.templateCommand, file);
    if (errors !== null) {
        return errors;
    }

    if (file.command !== 'add' && file.command !== 'delete') {
        return {error: `Bad command '${file.command} for file ${file.id}`};
    }

    let fileInProject = yield check.fileInProject(file.id, projectId);
    if (!fileInProject) {
        return {error: `File ${file.id} not in project ${projectId}`};
    }

    return null;
}

module.exports = {
    validateSample,
    validateProperty,
    validateFile
};
