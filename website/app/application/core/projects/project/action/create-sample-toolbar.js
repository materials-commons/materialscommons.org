Application.Directives.directive("createSampleToolbar", createSampleToolbarDirective);

function createSampleToolbarDirective() {
    return {
        replace: true,
        restrict: "AE",
        controller: "createSampleToolbarDirectiveController",
        templateUrl: "application/core/projects/project/action/create-sample-toolbar.html"
    };
}

Application.Controllers.controller("createSampleToolbarDirectiveController",
                                   ["$scope", "projectColors",
                                    createSampleToolbarDirectiveController]);

function createSampleToolbarDirectiveController($scope, projectColors) {
    $scope.setActive = function(what) {
        if ($scope.activeToolbarItem === what) {
            $scope.activeToolbarItem = ""; // toggle
        } else {
            $scope.activeToolbarItem = what;
        }
    };

    $scope.projectColor = function() {
        return {
            'background-color': projectColors.getCurrentProjectColor()
        };
    };
}
