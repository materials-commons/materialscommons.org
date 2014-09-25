Application.Directives.directive('wizardReviewContent', wizardReviewContentDirective);

function wizardReviewContentDirective() {
    return {
        scope: {},
        controller: "wizardReviewContentDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-review-content.html"
    };
}

Application.Controllers.controller("wizardReviewContentDirectiveController",
                                   ["$scope", wizardReviewContentDirectiveController]);

function wizardReviewContentDirectiveController($scope) {

}
