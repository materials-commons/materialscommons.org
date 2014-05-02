Application.Controllers.controller('toolbarProjectsPageOverview',
    ["$scope", "$stateParams", function ($scope, $stateParams) {
        function init() {
            $scope.project_id = $stateParams.id;
            $scope.from = $stateParams.from;
            $scope.processes = [];
        }

        init();
    }]);