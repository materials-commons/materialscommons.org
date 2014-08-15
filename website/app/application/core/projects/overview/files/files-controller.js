Application.Controllers.controller('projectsOverviewFiles',
    ["$scope", "$stateParams", "ProjectPath", "mcapi", function ($scope, $stateParams, ProjectPath, mcapi) {

        $scope.editDescription = function () {
            $scope.bk.edit_desc = true
        }

        $scope.save = function () {
            mcapi('/projects/%/update', $scope.project.id)
                .success(function (data) {
                    $scope.bk.edit_desc = false;
                }).put($scope.project);
        }

        function init() {
            $scope.bk = {
                edit_desc: false
            }
            $scope.project_id = $stateParams.id;
            $scope.from = ProjectPath.get_from();
            mcapi('/projects/%', $scope.project_id)
                .success(function (data) {
                    $scope.project = data
                }).jsonp();
        }

        init();
    }]);
