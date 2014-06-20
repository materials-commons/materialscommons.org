Application.Controllers.controller('toolbarProjectsPageOverview',
    ["$scope", "$stateParams", "pubsub", function ($scope, $stateParams, pubsub) {

        function init() {
//            if ($stateParams.id) {
//
//            } else {
//
//            }
            $scope.project_id = $stateParams.id;
            $scope.from = $stateParams.from;
            $scope.processes = [];
        }

        init();
    }]);