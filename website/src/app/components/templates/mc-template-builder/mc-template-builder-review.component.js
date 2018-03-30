class MCTemplateBuilderReviewComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcTemplateBuilderReview', {
    template: require('./mc-template-builder-review.html'),
    controller: MCTemplateBuilderReviewComponentController,
    bindings: {
        template: '<'
    }
});
