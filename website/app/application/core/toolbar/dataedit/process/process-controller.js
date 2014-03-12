Application.Controllers.controller('toolbarDataEditProcess',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "watcher",
        function ($scope, mcapi, User, $stateParams, alertService, watcher) {
            $scope.showProcessDetails = function (process_id) {
                mcapi('/processes/%', process_id)
                    .success(function (data) {
                        $scope.process = data;
                    }).jsonp();
                console.log($scope.process);
                $state.go('toolbar.dataedit.process');

            };


            $scope.init = function () {

            };
        }]);
