Application.Directives.directive('wizardStepFiles', wizardStepFilesDirective);

function wizardStepFilesDirective() {
    return {
        scope: {
            args: "="
        },
        controller: "wizardStepFilesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-files.html"
    };
}

Application.Controllers.controller('wizardStepFilesDirectiveController',
                                   ["$scope", "$stateParams", "model.projects", "provStep",
                                    wizardStepFilesDirectiveController]);
function wizardStepFilesDirectiveController($scope, $stateParams, projects, provStep) {
}
