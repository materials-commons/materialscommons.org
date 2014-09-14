Application.Directives.directive('wizardStepSample', wizardStepSampleDirective);

function wizardStepSampleDirective() {
    return {
        scope: {
            args: "="
        },
        controller: "wizardStepSampleDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-sample.html"
    };
}

Application.Controllers.controller('wizardStepSampleDirectiveController',
                                   ["$scope", "$stateParams", "model.projects", "provStep",
                                    wizardStepSampleDirectiveController]);
function wizardStepSampleDirectiveController($scope, $stateParams, projects, provStep) {
}
