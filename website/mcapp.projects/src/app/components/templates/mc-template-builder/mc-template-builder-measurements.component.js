class MCTemplateBuilderMeasurementsComponentController {
    /*@ngInject*/
    constructor() {
        this.measurements = [];
    }
}

angular.module('materialscommons').component('mcTemplateBuilderMeasurements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-measurements.html',
    controller: MCTemplateBuilderMeasurementsComponentController,
    bindings: {
        template: '<'
    }
});