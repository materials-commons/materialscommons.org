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
    var step = provStep.getCurrentStep($scope.wizardState.project.id);
    $scope.sample = $scope.wizardState.currentDraft[step.stepType][step.step].properties.sample;

    provStep.onLeave($stateParams.id, function() {
        setDoneState();
        var stepType = step.stepType;
        var stepName = step.step;
        if (!$scope.wizardState.currentDraft[stepType][stepName].done) {
            $scope.wizardState.currentDraft.completed = false;
        }
    });

    function setDoneState() {
        var stepType = step.stepType;
        var stepName = step.step;
        if ($scope.wizardState.currentDraft[stepType][stepName].properties.sample.sample) {
            $scope.wizardState.currentDraft[stepType][stepName].done = true;
        } else {
            $scope.wizardState.currentDraft[stepType][stepName].done = false;
        }
    }

    $scope.next = function() {
        var nextStep = provStep.nextStep(step.stepType, step.step,
                                         $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, nextStep);
    };
}
