class MCWorkflowToolbar2ComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcWorkflowToolbar2', {
    controller: MCWorkflowToolbar2ComponentController,
    template: require('./workflow-toolbar2.html'),
    bindings: {}
});