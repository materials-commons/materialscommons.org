Application.Directives.directive('projectActionBar', projectActionBarDirective);

function projectActionBarDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "projectActionBarDirectiveController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-action-bar.html"
    };
}

Application.Controllers.controller('projectActionBarDirectiveController',
                                   ["$scope", "projectColors",
                                    projectActionBarDirectiveController]);

function projectActionBarDirectiveController($scope, projectColors) {
    $scope.buttonStyle = function() {
        return {
            'background-color': projectColors.getCurrentProjectColor()
        };
    };

    $scope.action = "";

    $scope.toggleAction = function(action) {
        if ($scope.action === action) {
            $scope.action = "";
        } else {
            $scope.action = action;
        }
    };

    $scope.isCurrentAction = function(action) {
        return $scope.action === action;
    };
}
