Application.Controllers.controller('viewProcessesController',
    ["$scope", "$state", "mcapi","$stateParams", function ($scope, $state, mcapi, $stateParams) {

        $scope.showProvDetails = function (item) {
            switch (item.type) {
                case "id":
                    mcapi('/objects/%', item.properties.id.value)
                        .success(function (data) {
                            $scope.sample = data
                        }).jsonp();
                    break;
                case "condition":
                    $scope.item = item;
                    break;
                case "file":
                    $state.go('projects.dataedit.provenance', ({'data_id': item.properties.id.value}));
                    break;
            }
        }

    }]);

Application.Directives.directive('viewProcesses',
    function () {
        return {
            restrict: "A",
            controller: "viewProcessesController",
            scope: {
                processes: "=",
                doc: "=",
                sampleDoc: "="
            },
            templateUrl: 'application/directives/view-processes.html'
        };
    });