Application.Directives.directive('showStepProperties', showStepPropertiesDirective);

function showStepPropertiesDirective() {
    return {
        scope: {
            step: "=",
            template: "="
        },
        controller: "showStepPropertiesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-step-properties.html"
    };
}

Application.Controllers.controller('showStepPropertiesDirectiveController',
                                   ["$scope", showStepPropertiesDirectiveController]);

function showStepPropertiesDirectiveController($scope) {
    $scope.showValue = function(value) {
        if (value.name) {
            return value.name;
        }

        return value;
    };
}
