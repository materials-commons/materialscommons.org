Application.Controllers.controller('toolbarProcess',
    ["$scope", "mcapi", "$state", "$stateParams", "watcher", "$filter",
        function ($scope, mcapi, $state, $stateParams, watcher, $filter) {

            $scope.showtab = function (tab) {
                switch (tab) {
                    case "tags":
                        $state.go('toolbar.dataedit.tags');
                        break;
                    case "notes":
                        $state.go('toolbar.dataedit.notes');
                        break;
                    case "provenance":
                        $state.go('toolbar.dataedit.provenance');
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
            }

            init();
        }]);
