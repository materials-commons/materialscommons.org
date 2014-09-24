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
                                   ["$scope", "provStep", "pubsub", "actionStatus", "$stateParams",
                                    wizardNextStepDirectiveController]);
function wizardNextStepDirectiveController($scope, provStep, pubsub, actionStatus, $stateParams) {
    pubsub.waitOn($scope, "provenance.wizard.step", function() {
        $scope.wizardState = actionStatus.getCurrentActionState($stateParams.id);
        $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
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
        case "": return false;
        default: return true;
        }
    };
}
