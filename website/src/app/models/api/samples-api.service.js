class SamplesAPIService {
    constructor(projectsAPIRoute, Restangular, toast) {
        this.projectsAPIRoute = projectsAPIRoute;
        this.Restangular = Restangular;
        this.toast = toast;
    }

    getSample(sampleId) {
        return this.Restangular.one('v3').one('getSample').customPOST({sample_id: sampleId}).then(
            sample => sample.plain().data,
            e => this.toast.error(e.data.error)
        );
    }

    getSamplePath() {return 'v3/getSample';}

    getSamplePropertyMeasurements(projectId, sampleId, propertyId) {
        return this.Restangular.one('v3').one('getPropertyMeasurements').customPOST({
            project_id: projectId,
            sample_id: sampleId,
            property_id: propertyId,
        }).then(
            p => p.plain().data,
            e => this.toast.error(e.data.error)
        );
    }

    setAsBestMeasure(projectId, sampleId, propertyId, measurementId) {
        return this.Restangular.one('v3').one('setAsBestMeasure').customPOST({
            project_id: projectId,
            sample_id: sampleId,
            property_id: propertyId,
            measurement_id: measurementId,
        }).then(
            () => true,
            e => this.toast.error(e.data.error)
        );
    }

    clearBestMeasure(projectId, sampleId, propertyId) {
        return this.Restangular.one('v3').one('clearBestMeasure').customPOST({
            project_id: projectId,
            sample_id: sampleId,
            property_id: propertyId,
        }).then(
            () => true,
            e => this.toast.error(e.data.error)
        );
    }

    ///////////////////////////////////////////

    addSamplesToExperiment(projectId, experimentId, sampleIds) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples')
            .customPOST({samples: sampleIds}).then(sampleExperimentIds => sampleExperimentIds.plain());
    }

    createSamplesInProjectForProcess(projectId, processId, samples) {
        return this.projectsAPIRoute(projectId).one('samples')
            .customPOST({process_id: processId, samples: samples});
    }

    getProjectSample(projectId, sampleId) {
        return this.projectsAPIRoute(projectId).one('samples', sampleId).get().then(s => s.plain());
    }

    deleteSamplesFromExperiment(projectId, experimentId, processId, sampleIds) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').one('delete')
            .customPOST({process_id: processId, samples: sampleIds});
    }

    updateSampleInExperiment(projectId, experimentId, processId, sample) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples')
            .customPUT({
                process_id: processId,
                samples: [sample]
            });
    }

    addMeasurementsToSamples(projectId, experimentId, processId, samplesMeasurements) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').one('measurements')
            .customPOST({
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
        };
    }

    createProperty(name, attribute) {
        return {
            name: name,
            attribute: attribute
        };
    }

    createMeasurement(otype, property, unit, value) {
        return {
            name: property.name,
            attribute: property.attribute,
            otype: otype,
            unit: unit,
            value: value
        };
    }

    updateSampleFiles(projectId, sampleId, filesToAdd, filesToDelete) {
        let toAdd = filesToAdd.map(f => ({command: 'add', id: f.id}));
        let toDelete = filesToDelete.map(f => ({command: 'delete', id: f.id}));
        return this.projectsAPIRoute(projectId).one('samples', sampleId).one('files').customPUT({
            files: toAdd.concat(toDelete)
        });
    }
}

angular.module('materialscommons').service('samplesAPI', SamplesAPIService);
