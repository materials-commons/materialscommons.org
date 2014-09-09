Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "E",
        templateUrl: "application/core/projects/overview/sideboard.html"
    };
}

Application.Controllers.controller('tagsSideboardController',
                                   ["$scope", "User", tagsSideboardController]);

function tagsSideboardController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
}
