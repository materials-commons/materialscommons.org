class MCTemplateBuilderReviewComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcTemplateBuilderReview', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-review.html',
    controller: MCTemplateBuilderReviewComponentController,
    bindings: {
        template: '<'
    }
});