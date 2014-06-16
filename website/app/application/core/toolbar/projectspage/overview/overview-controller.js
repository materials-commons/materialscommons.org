Application.Controllers.controller('toolbarProjectsPageOverview',
    ["$scope", "$stateParams", "pubsub", function ($scope, $stateParams, pubsub) {
        $scope.callMe = function () {
            console.log("I was called");
            return false;
        }
        function init() {
            $scope.disable = true;
            $scope.project_id = $stateParams.id;
            $scope.from = $stateParams.from;
            $scope.processes = [];
        }

        init();
    }]);