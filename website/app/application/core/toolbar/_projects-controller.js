Application.Controllers.controller('_toolbarProjects',
    ["$scope", "mcapi", "$state",
        function ($scope, mcapi, $state) {
            $scope.init = function () {
                mcapi('/projects/by_group')
                    .success(function (data) {
                        $scope.projects = data;
                    })
                    .error(function (data) {

                    }).jsonp();
            };

            $scope.gotoProject = function (projectId) {
                $state.go("toolbar.projectspage.overview", {id: projectId});
            };

            $scope.init();
        }]);