Application.Controllers.controller('toolbarProjectsPageOverviewSamples',
    ["$scope", "$stateParams", function ($scope, $stateParams) {


        function init() {
            $scope.project_id = $stateParams.id;

        }

        init();
    }]);