Application.Controllers.controller('_toolbarProjects',
    ["$scope", "$state", "model.Projects",
        function ($scope, $state, Projects) {
            $scope.gotoProject = function (projectId) {
                $state.go("toolbar.projectspage.overview", {id: projectId, draft_id: ''});
            };

            function init() {
                Projects.getList().then(function (data) {
                    $scope.projects = data;
                });
            }

            init();
        }]);