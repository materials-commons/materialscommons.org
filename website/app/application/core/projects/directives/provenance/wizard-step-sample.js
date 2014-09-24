Application.Directives.directive('wizardStepSample', wizardStepSampleDirective);

function wizardStepSampleDirective() {
    return {
        scope: {},
        controller: "wizardStepSampleDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-sample.html"
    };
}

Application.Controllers.controller('wizardStepSampleDirectiveController',
                                   ["$scope", "provStep", "actionStatus", "$stateParams",
                                    wizardStepSampleDirectiveController]);
function wizardStepSampleDirectiveController($scope, provStep, actionStatus, $stateParams) {
    $scope.wizardState = actionStatus.getCurrentActionState($stateParams.id);
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
    $scope.next = function() {
        var nextStep = provStep.nextStep($scope.step.stepType, $scope.step.step,
                                         $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, nextStep);
    };
}
