class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor(templatesAPI, toast) {
        this.templatesAPI = templatesAPI;
        this.toast = toast;

        this.whichElements = 'measurements';
        this.template = MCTemplateBuilderComponentController.emptyTemplate();
    }

    static emptyTemplate() {
        return {
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

    done() {
        this.templatesAPI.createTemplate(this.template).then(
            () => null,
            () => this.toast.error('Unable to create template')
        );
    }

    cancel() {
        this.template = MCTemplateBuilderComponentController.emptyTemplate();
    }
}

angular.module('materialscommons').component('mcTemplateBuilder', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder.html',
    controller: MCTemplateBuilderComponentController
});