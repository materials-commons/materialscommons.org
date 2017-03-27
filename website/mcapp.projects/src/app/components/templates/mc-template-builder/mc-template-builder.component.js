class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor() {
        this.sections = [{
            name: '',
            description: '',
            setup: [],
            measurements: []
        }];
    }

    addSection() {
        this.sections.push({
            name: '',
            description: '',
            setup: [],
            measurements: []
        });
    }

    addSectionSetupProperty(section) {
        section.setup.push({name: ''});
    }

    addSectionMeasurementProperty(section) {
        section.measurements.push({name: ''});
    }
}

angular.module('materialscommons').component('mcTemplateBuilder', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder.html',
    controller: MCTemplateBuilderComponentController
});