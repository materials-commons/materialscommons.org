class MCTemplateBuilderMeasurementsComponentController {
    /*@ngInject*/
    constructor() {
        this.measurements = [];
        //this.measurements.push("item 1");
    }
}

angular.module('materialscommons').component('mcTemplateBuilderMeasurements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-measurements.html',
    controller: MCTemplateBuilderMeasurementsComponentController,
    bindings: {
        template: '<'
    }
});