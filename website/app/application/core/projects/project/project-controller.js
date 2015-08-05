Application.Controllers.controller('ProjectController',
    ["$scope", "ui", "project", "current", "projectFiles",
        "mcapi", "help", "projects", "$state", ProjectController]);

function ProjectController($scope, ui, project, current, projectFiles, mcapi,
                           help, projects, $state) {
    $scope.projects = projects;
    $scope.setProject = function (project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.showHelp = function () {
        return help.isActive();
    };

    $scope.isExpanded = function (what) {
        return help.isActive() && ui.isExpanded(project.id, what);
    };

    current.setProject(project);
    $scope.project = project;
    $scope.loaded = true;

    if (!(project.id in projectFiles.model.projects)) {
        $scope.loaded = false;
        mcapi("/projects/%/tree2", project.id)
            .success(function (files) {
                var obj = {};
                obj.dir = files[0];
                projectFiles.model.projects[project.id] = obj;
                //projectFiles.loadByMediaType(project);
                $scope.loaded = true;
            }).jsonp();
    }
}
