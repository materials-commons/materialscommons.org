Application.Directives.directive('wizardContextTags', wizardContextTagsDirective);

function wizardContextTagsDirective() {
    return {
        scope: {
            context: "="
        },
        controller: "wizardContextTagsController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/wizard-context-tags.html"
    };
}

Application.Controllers.controller('wizardContextTagsController',
                                   ["$scope", wizardContextTagsController]);

function wizardContextTagsController($scope) {

}
