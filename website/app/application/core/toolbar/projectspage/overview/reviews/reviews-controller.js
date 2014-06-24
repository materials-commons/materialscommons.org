Application.Controllers.controller('toolbarProjectsPageOverviewReviews',
    ["$scope", "$stateParams", function ($scope, $stateParams) {


        function init() {
            $scope.project_id = $stateParams.id;

        }

        init();
    }]);