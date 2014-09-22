Application.Directives.directive('wizardStepSample', wizardStepSampleDirective);

function wizardStepSampleDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "wizardStepSampleDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-sample.html"
    };
}

Application.Controllers.controller('wizardStepSampleDirectiveController',
                                   ["$scope", "provStep",
                                    wizardStepSampleDirectiveController]);
function wizardStepSampleDirectiveController($scope, provStep) {
    $scope.next = function() {
        var step = provStep.getCurrentStep($scope.project.id);
        var nextStep = provStep.nextStep(step.stepType, step.step,
                                        $scope.project.selectedTemplate);
        provStep.setStep($scope.project.id, nextStep);
    };
}
