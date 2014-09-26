Application.Directives.directive('wizardStepOverview', wizardStepOverviewDirective);

function wizardStepOverviewDirective() {
    return {
        scope: {
            template: "=",
            direction: "@"
        },
        controller: "wizardStepOverviewDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-overview.html"
    };
}

Application.Controllers.controller('wizardStepOverviewDirectiveController',
                                   ["$scope", wizardStepOverviewDirectiveController]);
function wizardStepOverviewDirectiveController($scope) {
    $scope.arrowClass = "arrow_box_" + $scope.direction;
    $scope.getPositionStyle = function() {
        if ($scope.direction === 'bottom') {
            return {
                bottom: "-30px"
            };
        }

        return {
          top: "-30px"
        };
    };
}
