class ProcessMeasurementsComponentController2 {
    /*@ngInject*/
    constructor(samplesAPI, toast, $stateParams) {
        this.samplesAPI = samplesAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.composition = null;
    }

    addPropertyMeasurement(property) {
        if (!this.samples.length) {
            this.toast.error('No samples to add measurements to.');
            return;
        }

        let samples = this.samples.map((s) => { return {id: s.id, property_set_id: s.property_set_id}; });
        let prop = this.samplesAPI.createProperty(property.name, property.attribute);
        let measurement = this.samplesAPI.createMeasurement(property.otype, prop, property.unit, property.value);
        if (property.measurement_id) {
            measurement.id = property.measurement_id;
        }
        measurement.is_best_measure = true;
        let samplesMeasurements = this.samplesAPI.createSamplesPropertyMeasurements(samples, 'separate', prop, [measurement]);

        this.samplesAPI.addMeasurementsToSamples(this.projectId, this.experimentId, this.processId, [samplesMeasurements])
            .then(
                () => this.toast.success(`${property.name} added`, 'bottom right'),
                () => this.toast.error('Failed to add measurements to samples')
            );
    }

    updatePropertyMeasurement(property) { // eslint-disable-line no-unused-vars
        // log('updatePropertyMeasurement', property.name);
    }
}

angular.module('materialscommons').component('processMeasurements', {
    template: require('./process-measurements.html'),
    controller: ProcessMeasurementsComponentController2,
    bindings: {
        measurements: '<',
        samples: '<',
        template: '<',
        processId: '<'
    }
});
