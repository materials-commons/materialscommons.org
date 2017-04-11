class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor() {
        this.whichElements = 'measurements';
        this.template = {
            name: '',
            template_type: 'create',
            description: '',
            does_transform: false,
            setup: [],
            measurements: []
        };
    }

    addSection() {
        this.sections.push({
            name: '',
            description: '',
            setup: []
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