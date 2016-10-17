class ProcessMeasurementsComponentController2 {
    /*@ngInject*/
    constructor(samplesService, toast, $stateParams) {
        this.samplesService = samplesService;
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
        let prop = this.samplesService.createProperty(property.name, property.attribute);
        let measurement = this.samplesService.createMeasurement(property._type, prop, property.unit, property.value);
        measurement.is_best_measure = true;
        let samplesMeasurements = this.samplesService.createSamplesPropertyMeasurements(samples, 'separate', prop, [measurement]);

        this.samplesService.addMeasurementsToSamples(this.projectId, this.experimentId, "fill-in-later", [samplesMeasurements])
            .then(
                () => null,
                () => this.toast.error('Failed to add measurements to samples')
            );
    }

    updatePropertyMeasurement(property) { // eslint-disable-line no-unused-vars
        // log('updatePropertyMeasurement', property.name);
    }
}

angular.module('materialscommons').component('processMeasurements', {
    templateUrl: 'app/global.components/process-measurements.html',
    controller: ProcessMeasurementsComponentController2,
    bindings: {
        measurements: '<',
        samples: '<',
        template: '<'
    }
});
