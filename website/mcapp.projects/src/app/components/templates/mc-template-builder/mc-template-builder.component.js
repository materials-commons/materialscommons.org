class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor() {
        this.whichElements = 'measurements';
        this.template = {
            name: '',
            process_type: 'create',
            template_description: '',
            does_transform: false,
            setup: [{
                name: 'Instrument',
                attribute: 'instrument',
                properties: []
            }],
            measurements: []
        };
    }
}

angular.module('materialscommons').component('mcTemplateBuilder', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder.html',
    controller: MCTemplateBuilderComponentController
});