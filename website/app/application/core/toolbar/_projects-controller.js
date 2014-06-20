Application.Controllers.controller('_toolbarProjects',
    ["$scope", "$state", "model.Projects", "ProjectPath", "watcher",
        function ($scope, $state, Projects, ProjectPath, watcher) {

            $scope.gotoProject = function (projectId) {
                ProjectPath.set_project(projectId);
                $state.go("toolbar.projectspage.overview", {id: projectId, draft_id: '', from: ''});
            };

            function init() {
//                Projects.getList().then(function (data) {
//                    $scope.projects = data;
//                });
                $state.go("toolbar.projectspage.overview", {id: '', draft_id: '', from: ''});
            }

            init();
        }]);