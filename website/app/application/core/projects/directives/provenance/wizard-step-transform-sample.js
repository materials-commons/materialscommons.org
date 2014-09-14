Application.Directives.directive('wizardStepTransformSample', wizardStepTransformSampleDirective);

function wizardStepTransformSampleDirective() {
    return {
        scope: {
            args: "="
        },
        controller: "wizardStepTransformSampleDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-transform-sample.html"
    };
}

Application.Controllers.controller('wizardStepTransformSampleDirectiveController',
                                   ["$scope", "$stateParams", "model.projects", "provStep",
                                    wizardStepTransformSampleDirectiveController]);
function wizardStepTransformSampleDirectiveController($scope, $stateParams, projects, provStep) {
}
