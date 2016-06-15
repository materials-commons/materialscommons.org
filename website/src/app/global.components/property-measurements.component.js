angular.module('materialscommons').component('propertyMeasurements', {
    templateUrl: 'app/global.components/property-measurements.html',
    controller: PropertyMeasurementsComponentController,
    bindings: {
        measurements: '<',
        taskId: '<',
        templateId: '<',
        attribute: '<'
    }
});


class PropertyMeasurementsComponentController {
    constructor() {

    }
}