class MCTemplateBuilderDescriptionComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcTemplateBuilderDescription', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-description.html',
    controller: MCTemplateBuilderDescriptionComponentController,
    bindings: {
        template: '<'
    }
});