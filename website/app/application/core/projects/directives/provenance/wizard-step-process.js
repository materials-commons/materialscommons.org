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
                                    "recent",
                                    wizardStepProcessController]);

function wizardStepProcessController($scope, provStep, $stateParams, projectState, recent) {
    var stateID = $stateParams.sid;
    var projectID = $stateParams.id;

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
        var templateName = $scope.wizardState.selectedTemplate.template_name;
        setDoneState();
        if (!$scope.wizardState.currentDraft.process.done) {
            $scope.wizardState.currentDraft.completed = false;
        }

        var name = $scope.wizardState.currentDraft.process.name;
        if (name === "") {
            recent.update(projectID, stateID, templateName);
        } else {
            recent.update(projectID, stateID, templateName + ": " + name);
        }
    });

    $scope.nextStep = function() {
        var step = provStep.nextStep("process", "process", $scope.wizardState.selectedTemplate);
        provStep.setStep($scope.wizardState.project.id, step);
    };

    $scope.cancelStep = function() {
        recent.gotoLast(projectID, stateID);
    };
}
