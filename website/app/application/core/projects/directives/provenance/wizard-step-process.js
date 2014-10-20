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
                                   ["$scope", "provStep", "$stateParams", "projectState",
                                    "ui",
                                    wizardStepProcessController]);

function wizardStepProcessController($scope, provStep, $stateParams, projectState, ui) {
    function setDoneState() {
        if (!$scope.wizardState.currentDraft.process.name) {
            $scope.wizardState.currentDraft.process.done = false;
            return;
        }
        var len = $scope.wizardState.currentDraft.process.name.length;
        $scope.wizardState.currentDraft.process.done = (len > 0);
    }

    $scope.wizardState = projectState.get($stateParams.id, $stateParams.sid);
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);

    provStep.onLeave($stateParams.id, function() {
        setDoneState();
        if (!$scope.wizardState.currentDraft.process.done) {
            $scope.wizardState.currentDraft.completed = false;
        }
    });

    $scope.nextStep = function() {
        var step = provStep.nextStep("process", "process", $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, step);
    };

    $scope.cancelStep = function() {
        var projectID = $scope.wizardState.project.id;
        ui.setShowFiles(projectID, true);
    };
}
