Application.Directives.directive('wizardStepTransformSample', wizardStepTransformSampleDirective);

function wizardStepTransformSampleDirective() {
    return {
        scope: {
            wizardState: "="
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
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
    $scope.next = function() {
        var nextStep = provStep.nextStep($scope.step.stepType, $scope.step.step,
                                         $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, nextStep);
    };
}
