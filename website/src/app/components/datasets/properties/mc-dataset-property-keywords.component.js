class MCDatasetPropertyKeywordsComponentController {
    /*@ngInject*/
    constructor() {
    }
}

angular.module('materialscommons').component('mcDatasetPropertyKeywords', {
    template: `
        <label>Keywords/Tags</label>
        <span style="padding-left: 5px;"
                ng-repeat="keyword in $ctrl.dataset.keywords">
            '{{keyword}}'
        </span>
    `,
    controller: MCDatasetPropertyKeywordsComponentController,
    bindings: {
        dataset: '<'
    }
});