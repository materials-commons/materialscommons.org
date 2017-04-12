class MCTemplateBuilderSetupComponentController {
    /*@ngInject*/
    constructor() {
        this.setup = [{
            name: 'Instrument',
            attribute: 'instrument',
            properties: []
        }];
    }
}

angular.module('materialscommons').component('mcTemplateBuilderSetup', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-setup.html',
    controller: MCTemplateBuilderSetupComponentController,
    bindings: {
        template: '<'
    }
});