class MCTemplateBuilderDescriptionComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcTemplateBuilderDescription', {
    template: require('./mc-template-builder-description.html'),
    controller: MCTemplateBuilderDescriptionComponentController,
    bindings: {
        template: '<'
    }
});
