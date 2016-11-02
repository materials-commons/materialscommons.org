const check = require('../../db/model/check');
const schema = require('../../schema');

function* validateSample(projectId, sample) {
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

module.exports = {
    validateSample
};
