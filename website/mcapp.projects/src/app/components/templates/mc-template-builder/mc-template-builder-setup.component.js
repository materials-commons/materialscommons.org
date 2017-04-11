class MCTemplateBuilderSetupComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcTemplateBuilderSetup', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-setup.html',
    controller: MCTemplateBuilderSetupComponentController,
    bindings: {
        template: '<'
    }
});