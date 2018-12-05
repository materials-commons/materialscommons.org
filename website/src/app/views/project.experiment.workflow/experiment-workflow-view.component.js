class MCExperimentWorflowViewComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcExperimentWorkflowView', {
    controller: MCExperimentWorflowViewComponentController,
    template: require('./experiment-workflow-view.html'),
    bindings: {}
});