Application.Controllers.controller('toolbarDataEditDisplayProcess',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "watcher",
        function ($scope, mcapi, User, $stateParams, alertService, watcher) {

            $scope.showProcessDetails = function (process_id) {
                mcapi('/processes/%', process_id)
                    .success(function (data) {
                        $scope.process = data;
                    }).jsonp();
            };

            $scope.init = function () {

            };
        }]);
