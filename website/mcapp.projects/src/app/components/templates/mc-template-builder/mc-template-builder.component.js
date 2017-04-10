class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor() {
        this.sections = [{
            name: '',
            description: '',
            setup: [],
        }];
        this.measurements = [];
    }

    addSection() {
        this.sections.push({
            name: '',
            description: '',
            setup: [],
        });
    }

    addSectionSetupProperty(section) {
        section.setup.push({name: ''});
    }

    addMeasurementProperty() {
        this.measurements.push({name: ''});
    }
}

angular.module('materialscommons').component('mcTemplateBuilder', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder.html',
    controller: MCTemplateBuilderComponentController
});