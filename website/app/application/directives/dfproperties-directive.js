Application.Controllers.controller("DFPropertiesController",
    ["$scope", "watcher", function ($scope, watcher) {
        function init() {
            $scope.m = {
                machine: {}
            };
        }

        init();


        watcher.watch($scope, "machinesList", function () {
            if (!$scope.machinesList) {
                return;
            }
            var mindex, i;
            mindex = _.indexOf($scope.defaultProperties, function (item) {
                return item.attribute === "machine";
            });

            if (mindex !== -1) {
                $scope.m.machine = $scope.defaultProperties[mindex].value;
            }

            if (mindex !== -1) {
                i = _.indexOf($scope.machinesList, function (item) {
                    return item.id === $scope.defaultProperties[mindex].value.id;
                });
                if (i !== -1) {
                    $scope.m.machine = $scope.machinesList[i];
                }
            }
        });

        watcher.watch($scope, "m.machine", function (value) {
            if (!$scope.machinesList) {
                return;
            }
            var mindex, i;
            i = _.indexOf($scope.machinesList, function (item) {
                return (item.id === $scope.m.machine.id);
            });
            if (i !== -1) {
                mindex = _.indexOf($scope.defaultProperties, function (item) {
                    return item.attribute === "machine";
                });

                if (mindex !== -1) {
                    $scope.defaultProperties[mindex].value = $scope.m.machine;
                }
            }
        });

//

    }]);
Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            controller: 'DFPropertiesController',
            scope: {
                defaultProperties: '=',
                machinesList: '=',
                edit: "="
            },
            templateUrl: 'application/directives/default-properties.html'
        };
    });
