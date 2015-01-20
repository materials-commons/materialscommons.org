Application.Directives.directive('homeSideboard', homeSideboardDirective);
function homeSideboardDirective() {
    return {
        restrict: "A",
        controller: 'homeSideboardDirectiveController',
        scope: {
            project: '=project',
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
    var result = [];
    if ($scope.empty) {
        result = sideboard.get($scope.project.id);
        $scope.sideboard = result.emptySideBoard;
    } else {
        result = sideboard.get($scope.project.id);
        $scope.sideboard = result.sideboard;

    }

    $scope.splitScreen = function (what, col) {
        ui.toggleColumns(what, col, $scope.project.id);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    $scope.onDrop = function (ignore, item, event) {
        if ($scope.empty) {
            sideboard.handleFromEvent($scope.project.id, item, event, 'emptySideBoard');
        } else {
            var i = _.indexOf($scope.sideboard, function (f) {
                return f.id === item.id;
            });
            // If item is already in list then don't add it again.
            if (i === -1) {
                sideboard.handleFromEvent($scope.project.id, item, event, 'sideboard');

            }
        }
    };
}
