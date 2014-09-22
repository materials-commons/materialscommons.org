Application.Directives.directive('wizardNextStep', wizardNextStepDirective);

function wizardNextStepDirective() {
    return {
        scope: {
            project: "=",
            showSteps: "="
        },
        controller: "wizardNextStepDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-next-step.html"
    };
}

Application.Controllers.controller('wizardNextStepDirectiveController',
                                   ["$scope", "provStep", "pubsub", wizardNextStepDirectiveController]);
function wizardNextStepDirectiveController($scope, provStep, pubsub) {
    pubsub.waitOn($scope, "provenance.wizard.step", function() {
        $scope.step = provStep.getCurrentStep($scope.project.id);
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
