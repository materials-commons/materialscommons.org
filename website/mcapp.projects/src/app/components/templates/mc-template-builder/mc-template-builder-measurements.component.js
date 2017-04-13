class MCTemplateBuilderMeasurementsComponentController {
    /*@ngInject*/
    constructor(templateUnits) {
        this.measurements = [];
        this.templateUnits = templateUnits;
    }

    addUnits() {
        this.templateUnits.showChoices().then(
            (unitType) => console.log('unitType chosen', unitType)
        )
    }
}

angular.module('materialscommons').component('mcTemplateBuilderMeasurements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-measurements.html',
    controller: MCTemplateBuilderMeasurementsComponentController,
    bindings: {
        template: '<'
    }
});