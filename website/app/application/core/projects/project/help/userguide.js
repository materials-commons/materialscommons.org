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
                                   ["$scope", "help", userguideDirectiveController]);
function userguideDirectiveController($scope, help) {
    $scope.close = function() {
        help.toggle();
    };
}
