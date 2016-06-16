angular.module('materialscommons').component('processMeasurements', {
    templateUrl: 'app/global.components/process-measurements.html',
    controller: ProcessMeasurementsComponentController,
    bindings: {
        measurements: '<',
        taskId: '<',
        templateId: '<'
    }
});


class ProcessMeasurementsComponentController {
    constructor() {

    }
}