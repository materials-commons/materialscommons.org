class MCTemplateBuilderElementsComponentController {
    /*@ngInject*/
    constructor() {
        console.log('mcTemplateBuilderElements');
        this.measurements = [];
        this.properties = [];
    }

    $onInit() {
        for (let i = 0; i < 100; i++) {
            this.measurements.push(`measurement ${i}`);
            this.properties.push(`setup ${i}`);
        }
    }
}

angular.module('materialscommons').component('mcTemplateBuilderElements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-elements.html',
    controller: MCTemplateBuilderElementsComponentController,
    bindings: {
        elements: '<'
    }
});