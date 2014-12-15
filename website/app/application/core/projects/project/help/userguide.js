Application.Directives.directive("userguide", userguideDirective);
function userguideDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/help/userguide.html",
        controller: "userguideDirectiveController"
    };
}

Application.Controllers.controller("userguideDirectiveController",
                                   ["$scope", "help", "ui", "$stateParams", userguideDirectiveController]);
function userguideDirectiveController($scope, help, ui, $stateParams) {
    $scope.close = function() {
        help.toggle();
        ui.setIsExpanded($stateParams.id, "help", false);
    };

    $scope.toggleExpand = function() {
        ui.toggleIsExpanded($stateParams.id, "help");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($stateParams.id, "help");
    };
}
