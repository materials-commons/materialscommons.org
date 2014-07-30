Application.Controllers.controller('projectsOverviewNotes',
    ["$scope", "mcapi", "$stateParams",
        function ($scope, mcapi, $stateParams) {

            $scope.getProject = function () {
                mcapi('/projects/%', $scope.project_id)
                    .success(function (project) {
                        $scope.project = project;
                    }).jsonp();
            };

            function init() {
                $scope.project_id = $stateParams.id;
                $scope.getProject()
            }

            init();
        }]);