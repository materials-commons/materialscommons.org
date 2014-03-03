Application.Controllers.controller('_toolbarOverviewProjectModal',
    ["$scope", "mcapi",
        function ($scope, mcapi) {
            $scope.updateProject = function () {
                if ($scope.description !== "") {
                    $scope.whichProject.description = $scope.description;
                    mcapi('/projects/%/update', $scope.whichProject.id)
                        .put({description: $scope.description});
                }
                $scope.description = "";
            };

            $scope.editProjectKeypress = function () {
                $scope.updateProject();
                $scope.dismissModal();
            };

            $scope.editProject = function () {
                $scope.updateProject();
                $scope.dismissModal();
            };

        }]);