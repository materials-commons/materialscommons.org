class SamplesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    addSamplesToExperiment(projectId, experimentId, sampleIds) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples')
            .customPOST({samples: sampleIds});
    }

    createSamplesInProjectForProcess(projectId, processId, samples) {
        return this.projectsAPI(projectId).one('samples').customPOST({process_id: processId, samples: samples});
    }

    getProjectSamples(projectID) {
        return this.projectsAPI(projectID).one('samples').getList();
    }

    getProjectSample(projectId, sampleId) {
        return this.projectsAPI(projectId).one('samples', sampleId).get();
    }

    deleteSamplesFromExperiment(projectId, experimentId, processId, sampleIds) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples').one('delete')
            .customPOST({process_id: processId, samples: sampleIds});
    }

    updateSampleInExperiment(projectId, experimentId, processId, sample) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples')
            .customPUT({
                process_id: processId,
                samples: [sample]
            });
    }

    addMeasurementsToSamples(projectId, experimentId, processId, samplesMeasurements) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples').one('measurements')
            .customPOST({
                process_id: processId,
                properties: samplesMeasurements
            });
    }

    updateMeasurementsToSamples(projectId, experimentId, processId, samplesMeasurements) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples').one('measurements')
            .customPUT({
                process_id: processId,
                properties: samplesMeasurements
            });
    }

    createSamplesPropertyMeasurements(samples, addAs, property, measurements) {
        if (addAs !== 'shared' && addAs !== 'separate') {
            return null;
        }
        return {
            samples: samples,
            add_as: addAs,
            property: property,
            measurements: measurements
        }
    }

    createProperty(name, attribute) {
        return {
            name: name,
            attribute: attribute
        }
    }

    createMeasurement(_type, property, unit, value) {
        return {
            name: property.name,
            attribute: property.attribute,
            _type: _type,
            unit: unit,
            value: value
        }
    }
}

angular.module('materialscommons').service('samplesService', SamplesService);