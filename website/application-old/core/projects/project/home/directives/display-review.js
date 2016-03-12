(function (module) {
    module.directive("displayReview", displayReviewDirective);
    function displayReviewDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                review: "=review"
            },
            controller: "DisplayReviewDirectiveController",
            controllerAs: 'view',
            bindToController: true,
            templateUrl: "application/core/projects/project/home/directives/display-review.html"
        };
    }

    //////////////////////////////////

    module.controller("DisplayReviewDirectiveController", DisplayReviewDirectiveController);

    DisplayReviewDirectiveController.$inject = [];

    /* @ngInject */
    function DisplayReviewDirectiveController() {
    }

}(angular.module('materialscommons')));
