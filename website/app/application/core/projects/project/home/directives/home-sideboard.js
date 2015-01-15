Application.Directives.directive('homeSideboard', homeSideboardDirective);
function homeSideboardDirective() {
    return {
        restrict: "A",
        controller: 'homeSideboardDirectiveController',
        scope: {
            project: '=project' ,
            empty: '=',
            splitIcon: '='
        },
        templateUrl: 'application/core/projects/project/home/directives/home-sideboard.html'
    };
}

Application.Controllers.controller("homeSideboardDirectiveController",
                                   ["$scope", "ui", "sideboard",
                                    homeSideboardDirectiveController]);
function homeSideboardDirectiveController($scope, ui, sideboard) {
    if($scope.empty){
        $scope.sideboard = [];
    }else{
        $scope.sideboard = sideboard.get($scope.project.id);
    }

    $scope.splitScreen = function(what, col){
        ui.toggleColumns(what, col, $scope.project.id);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

}
