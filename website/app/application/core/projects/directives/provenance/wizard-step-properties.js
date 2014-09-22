Application.Directives.directive('wizardStepProperties', wizardStepPropertiesDirective);

function wizardStepPropertiesDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "wizardStepPropertiesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-properties.html"
    };
}

Application.Controllers.controller('wizardStepPropertiesDirectiveController',
                                   ["$scope", "provStep",
                                    wizardStepPropertiesDirectiveController]);
function wizardStepPropertiesDirectiveController($scope, provStep) {
    var step = provStep.getCurrentStep($scope.project.id);
    $scope.template = provStep.templateForStep($scope.project.selectedTemplate, step);

    $scope.next = function() {
        provStep.setProjectNextStep($scope.project.id, $scope.project.selectedTemplate);
    };
}
