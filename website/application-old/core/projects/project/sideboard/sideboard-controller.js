(function (module) {
    module.controller("projectSideboard", projectSideboard);
    projectSideboard.$inject = ["$scope", "ui", "sideboard"];

    function projectSideboard($scope, ui, sideboard) {
        var result = [];
        if ($scope.empty) {
            result = sideboard.get($scope.project.id);
            $scope.sideboard = result.emptySideBoard;
        } else {
            result = sideboard.get($scope.project.id);
            $scope.sideboard = result.sideboard;
        }

        $scope.toggleExpanded = function () {
            ui.toggleIsExpanded($scope.project.id, "sideboard");
        };

        $scope.isExpanded = function () {
            return ui.isExpanded($scope.project.id, "sideboard");
        };

        $scope.minimize = function () {
            ui.togglePanelState($scope.project.id, 'sideboard');
        };

        $scope.splitScreen = function () {
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
}(angular.module('materialscommons')));
