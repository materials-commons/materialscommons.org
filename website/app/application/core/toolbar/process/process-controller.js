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
                    }).jsonp();
                $scope.showtab('notes');
            }

            init();
        }]);
