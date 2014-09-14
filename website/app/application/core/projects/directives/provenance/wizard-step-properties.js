Application.Directives.directive('wizardStepProperties', wizardStepPropertiesDirective);

function wizardStepPropertiesDirective() {
    return {
        scope: {
            args: "="
        },
        controller: "wizardStepPropertiesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-properties.html"
    };
}

Application.Controllers.controller('wizardStepPropertiesDirectiveController',
                                   ["$scope", "$stateParams", "model.projects", "provStep",
                                    wizardStepPropertiesDirectiveController]);
function wizardStepPropertiesDirectiveController($scope, $stateParams, projects, provStep) {
}
