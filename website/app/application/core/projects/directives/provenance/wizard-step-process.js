Application.Directives.directive('wizardStepProcess', wizardStepProcessDirective);

function wizardStepProcessDirective() {
    return {
        scope: {},
        controller: "wizardStepProcessController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-process.html"
    };
}

Application.Controllers.controller('wizardStepProcessController',
                                   ["$scope", "provStep", "$stateParams", "actionStatus",
                                    wizardStepProcessController]);

function wizardStepProcessController($scope, provStep, $stateParams, actionStatus) {
    $scope.wizardState = actionStatus.getCurrentActionState($stateParams.id);
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
    $scope.nextStep = function() {
        var step = provStep.nextStep("process", "process", $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, step);
    };

    $scope.cancelStep = function() {
        $scope.wizardState.selectedTemplate = null;
        $scope.step = provStep.setStep(provStep.makeStep("start", "start"));
    };
}
