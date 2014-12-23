Application.Directives.directive('homeSideboard', homeSideboardDirective);
function homeSideboardDirective() {
    return {
        restrict: "A",
        controller: 'homeSideboardDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-sideboard.html'
    };
}

Application.Controllers.controller("homeSideboardDirectiveController",
                                   ["$scope", "ui", "sideboard",
                                    homeSideboardDirectiveController]);
function homeSideboardDirectiveController($scope, ui, sideboard) {
    $scope.sideboard = sideboard.get($scope.project.id);
}
