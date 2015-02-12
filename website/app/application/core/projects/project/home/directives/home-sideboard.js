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

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "sideboard");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "sideboard");
    };

    $scope.minimize = function() {
        ui.togglePanelState($scope.project.id, 'sideboard');
    };

    $scope.splitScreen = function (what, col) {
        //ui.toggleColumns($scope.project.id, what, col);
        //ui.toggleIsExpanded($scope.project.id, "sideboard");

        ui.togglesideboards($scope.project.id);
        ui.toggleIsExpanded($scope.project.id, "sideboard");

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
