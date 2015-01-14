Application.Directives.directive('homeSideboard', homeSideboardDirective);
function homeSideboardDirective() {
    return {
        restrict: "A",
        controller: 'homeSideboardDirectiveController',
        scope: {
            project: '=project' ,
            empty: '='
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
        console.log($scope.sideboard);
    }
    $scope.splitScreen = function(what){
        ui.setColumn(what, '', $scope.project.id);
    };

}
