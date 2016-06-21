class ProcessMeasurementsComponentController2 {
    /*@ngInject*/
    constructor(samplesService, toast, $stateParams) {
        this.samplesService = samplesService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    $onInit() {
        console.dir(this.measurements);
    }

    addPropertyMeasurement(property) {
        if (!this.samples.length) {
            return;
        }

        let samples = this.samples.map((s) => { return {id: s.id, property_set_id: s.property_set_id}; });
        let prop = this.samplesService.createProperty(property.name, property.attribute);
        let measurement = this.samplesService.createMeasurement(property._type, prop, property.unit, property.value);
        let samplesMeasurements = this.samplesService.createSamplesPropertyMeasurements(samples, 'separate', prop, [measurement]);

        console.dir(samplesMeasurements);

        this.samplesService.addMeasurementsToSamples(this.projectId, this.experimentId, "fill-in-later", samplesMeasurements)
            .then(
                () => null,
                () => this.toast('Failed to add measurements to samples')
            );
    }

    updatePropertyMeasurement(property) {

    }
}

angular.module('materialscommons').component('processMeasurements', {
    templateUrl: 'app/global.components/process-measurements.html',
    controller: ProcessMeasurementsComponentController2,
    bindings: {
        measurements: '<',
        samples: '<'
    }
});