Application.Directives.directive('wizardNextStep', wizardNextStepDirective);

function wizardNextStepDirective() {
    return {
        scope: {},
        controller: "wizardNextStepDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-next-step.html"
    };
}

Application.Controllers.controller('wizardNextStepDirectiveController',
                                   ["$scope", "provStep", "pubsub", "projectState", "$stateParams",
                                    "ui", wizardNextStepDirectiveController]);
function wizardNextStepDirectiveController($scope, provStep, pubsub, projectState, $stateParams, ui) {
    pubsub.waitOn($scope, "provenance.wizard.step", function() {
        $scope.wizardState = projectState.get($stateParams.id, $stateParams.sid);
        $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
        if ($scope.step.step === "files") {
            ui.setShowFiles($stateParams.id, true);
        } else {
            ui.setShowFiles($stateParams.id, false);
        }
    });

    $scope.showPropertiesStep = function() {
        if (! $scope.step) {
            return false;
        }

        switch ($scope.step.step) {
        case "process": return false;
        case "sample": return false;
        case "transform-sample": return false;
        case "files": return false;
        case "done": return false;
        case "": return false;
        default: return true;
        }
    };
}
