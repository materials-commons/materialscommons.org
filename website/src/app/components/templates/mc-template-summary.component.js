class MCTemplateSummaryComponentController {
    /*@ngInject*/
    constructor() {
    }
}

angular.module('materialscommons').component('mcTemplateSummary', {
    template: require('./mc-template-summary.html'),
    controller: MCTemplateSummaryComponentController
});
