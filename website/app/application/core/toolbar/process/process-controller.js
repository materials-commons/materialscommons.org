Application.Controllers.controller('toolbarProcess',
    ["$scope", "mcapi", "$state", "$stateParams", "watcher", "$filter",
        function ($scope, mcapi, $state, $stateParams, watcher, $filter) {

            $scope.showtab = function (tab) {
                switch (tab) {
                    case "tags":
                        $state.go('toolbar.process.tags');
                        break;
                    case "notes":
                        $state.go('toolbar.process.notes');
                        break;
                    case "provenance":
                        $state.go('toolbar.process.provenance');
                        break;
                }
            };

            function init() {
                var process_id = $stateParams.id;
                mcapi('/processes/%', process_id)
                    .success(function (data) {
                        $scope.process = data;
                        $scope.birthtime = $filter('toDateString')($scope.process.birthtime);
                        if ('machine' in $scope.process.properties) {
                            mcapi('/machines/%', $scope.process.properties.machine.value)
                                .success(function (data) {
                                    $scope.machine = data;
                                }).jsonp();
                        }


                    }).jsonp();
                $scope.showtab('provenance');
            }

            init();
        }]);
