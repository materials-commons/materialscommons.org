Application.Controllers.controller('projectsOverviewFiles',
    ["$scope", "$stateParams", "ProjectPath", function ($scope, $stateParams, ProjectPath) {
        function init() {
            $scope.project_id = $stateParams.id;
            $scope.from = ProjectPath.get_from();
        }

        init();
    }]);
