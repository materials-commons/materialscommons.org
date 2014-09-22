Application.Directives.directive('wizardStepSample', wizardStepSampleDirective);

function wizardStepSampleDirective() {
    return {
        scope: {
            project: "=",
            template: "="
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
        var nextStep = provStep.nextStep($scope.step.stepType, $scope.step.step,
                                        $scope.project.selectedTemplate);
        provStep.setStep($scope.project.id, nextStep.stepType, nextStep.step);
    };
}
