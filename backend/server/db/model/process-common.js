module.exports = function(r) {
    const model = require('./model')(r);
    const _ = require('lodash');

    return {
        updateExperimentProcessFiles,
        updateProperties,
        updateExperimentProcessSamples
    };

    function* updateExperimentProcessFiles(experimentId, processId, files) {
        let filesToAddToProcess = files.filter(f => f.command === 'add').map(f => new model.Process2File(processId, f.id, ''));
        filesToAddToProcess = yield removeExistingProcessFileEntries(processId, filesToAddToProcess);
        if (filesToAddToProcess.length) {
            yield r.table('process2file').insert(filesToAddToProcess);
        }

        let filesToDeleteFromProcess = files.filter(f => f.command === 'delete').map(f => [processId, f.id]);
        if (filesToDeleteFromProcess.length) {
            yield r.table('process2file').getAll(r.args(filesToDeleteFromProcess, {index: 'process_data'})).delete();
        }

        let filesToAddToExperiment = files.filter(f => f.command === 'add').map(f => new model.Experiment2DataFile(experimentId, f.id));
        filesToAddToExperiment = yield removeExistingExperimentFileEntries(experimentId, filesToAddToExperiment);
        if (filesToAddToExperiment.length) {
            yield r.table('experiment2datafile').insert(filesToAddToExperiment);
        }

        // TODO: Delete files from experiment if the file is not used in any process associated with experiment.

        return null;
    }

    function* removeExistingProcessFileEntries(processId, files) {
        if (files.length) {
            let indexEntries = files.map(f => [processId, f.datafile_id]);
            let matchingEntries = yield r.table('process2file').getAll(r.args(indexEntries), {index: 'process_datafile'});
            var byFileID = _.indexBy(matchingEntries, 'datafile_id');
            return files.filter(f => (!(f.datafile_id in byFileID)));
        }

        return files;
    }

    function* removeExistingExperimentFileEntries(experimentId, files) {
        if (files.length) {
            let indexEntries = files.map(f => [experimentId, f.datafile_id]);
            let matchingEntries = yield r.table('experiment2datafile').getAll(r.args(indexEntries), {index: 'experiment_datafile'});
            var byFileID = _.indexBy(matchingEntries, 'datafile_id');
            return files.filter(f => (!(f.datafile_id in byFileID)));
        }

        return files;
    }

    function* updateProperties(properties) {
        // Validate that the retrieved property matches that we are updating
        let errors = [];
        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];
            // getAll returns an array
            let existingPropertyMatches = yield r.table('setupproperties')
                .getAll([property.id, property.setup_id], {index: 'id_setup_id'});
            if (!existingPropertyMatches.length) {
                // Skip, bad property
                errors.push({error: `No matching property/setup ${property.id}.${property.setup_id}`});
                continue;
            }
            let existingProperty = existingPropertyMatches[0];
            if (existingProperty.attribute !== property.attribute) {
                errors.push({error: `Attributes don't match: ${property.id}/${property.attribute} doesn't match ${existingProperty.attribute}`});
            } else if (existingProperty._type !== property._type) {
                errors.push({error: `Types don't match: ${property.id}/${property._type} doesn't match ${existingProperty._type}`});
            } else {
                existingProperty.value = property.value;
                existingProperty.unit = property.unit;
                existingProperty.description = property.description;
                yield r.table('setupproperties').get(property.id).update(existingProperty);
            }
        }

        if (errors.length) {
            return {errors: errors};
        }

        return null;
    }

    function* updateExperimentProcessSamples(experimentId, processId, samples) {
        let samplesToAddToProcess = samples.filter(s => s.command === 'add').map(s => new model.Process2Sample(processId, s.id, s.property_set_id, ''));
        samplesToAddToProcess = yield removeExistingProcessSampleEntries(processId, samplesToAddToProcess);
        if (samplesToAddToProcess.length) {
            yield r.table('process2sample').insert(samplesToAddToProcess);
        }

        let samplesToDeleteFromProcess = samples.filter(s => s.command === 'delete').map(s => [processId, s.id, s.property_set_id]);
        if (samplesToDeleteFromProcess.length) {
            yield r.table('process2sample').getAll(r.args(samplesToDeleteFromProcess, {index: 'process_sample'})).delete();
        }

        let samplesToAddToExperiment = samples.filter(s => s.command === 'add').map(s => new model.Experiment2Sample(experimentId, s.id));
        samplesToAddToExperiment = yield removeExistingExperimentSampleEntries(experimentId, samplesToAddToExperiment);
        if (samplesToAddToExperiment.length) {
            yield r.table('experiment2sample').insert(samplesToAddToExperiment);
        }

        // TODO: Delete samples from experiment if the sample is not used in any process associated with experiment.

        return null;
    }

    function* removeExistingProcessSampleEntries(processId, samples) {
        if (samples.length) {
            let indexEntries = samples.map(s => [processId, s.sample_id, s.property_set_id]);
            let matchingEntries = yield r.table('process2sample').getAll(r.args(indexEntries), {index: 'process_sample_property_set'});
            var bySampleID = _.indexBy(matchingEntries, 'sample_id');
            return samples.filter(s => (!(s.sample_id in bySampleID)));
        }

        return samples;
    }

    function* removeExistingExperimentSampleEntries(experimentId, samples) {
        if (samples.length) {
            let indexEntries = samples.map(s => [experimentId, s.sample_id]);
            let matchingEntries = yield r.table('experiment2sample').getAll(r.args(indexEntries), {index: 'experiment_sample'});
            var bySampleID = _.indexBy(matchingEntries, 'sample_id');
            return samples.filter(s => (!(s.sample_id in bySampleID)));
        }

        return samples;
    }
};


