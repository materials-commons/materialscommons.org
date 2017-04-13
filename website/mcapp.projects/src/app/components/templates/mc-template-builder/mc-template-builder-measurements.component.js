class MCTemplateBuilderMeasurementsComponentController {
    /*@ngInject*/
    constructor(templateUnits) {
        this.unit = '';
        this.measurements = [];
        this.templateUnits = templateUnits;
    }

    addUnits(measurement) {
        this.templateUnits.showChoices().then(
            (unitType) => measurement.units = unitType.units
        );
    }

    addNewUnit(measurement) {
        measurement.units.push(this.unit);
        measurement.editUnits = false;
        this.unit = '';
    }
}

angular.module('materialscommons').component('mcTemplateBuilderMeasurements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-measurements.html',
    controller: MCTemplateBuilderMeasurementsComponentController,
    bindings: {
        template: '<'
    }
});