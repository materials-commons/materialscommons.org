class MCTemplateBuilderElementsComponentController {
    /*@ngInject*/
    constructor(templatePropertyTypes) {
        this.templatePropertyTypes = templatePropertyTypes;
        this.measurements = [];
        this.setup = [];
    }

    $onInit() {
        this.templatePropertyTypes.getMeasurementPropertyTypes().then(
            (measurementTypes) => this.measurements = measurementTypes
        );

        this.templatePropertyTypes.getSetupPropertyTypes().then(
            (setupTypes) => this.setup = setupTypes
        );
    }
}

angular.module('materialscommons').component('mcTemplateBuilderElements', {
    template: require('./mc-template-builder-elements.html'),
    controller: MCTemplateBuilderElementsComponentController,
    bindings: {
        elements: '<'
    }
});
