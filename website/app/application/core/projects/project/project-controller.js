Application.Controllers.controller('projectsProject',
                                   ["$scope", "provStep", "ui",
                                    "project", "current", "pubsub", "User",
                                    "projectFiles", "mcapi", "help", "sideboard", "projects",
                                    "$state",
                                    projectsProject]);

function projectsProject ($scope, provStep, ui, project, current,
                          pubsub, User, projectFiles, mcapi,
                          help, sideboard, projects, $state) {
    $scope.projects = projects;
    $scope.sideboard = sideboard.get(project.id);
    console.dir($scope.projects);
    $scope.setProject = function (project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.showHelp = function() {
        return help.isActive();
    };

    $scope.isExpanded = function(what) {
        return help.isActive() && ui.isExpanded(project.id, what);
    };

    current.setProject(project);
    pubsub.send("sidebar.project");

    provStep.addProject(project.id);
    $scope.project = project;

    $scope.showTabs = function() {
        return ui.showToolbarTabs(project.id);
    };

    $scope.showFiles = function() {
        return ui.showFiles(project.id);
    };

    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };
    $scope.mcuser = User.attr();

    $scope.loaded = true;

    if (!(project.id in projectFiles.model.projects)) {
        $scope.loaded = false;
        mcapi("/projects/%/tree2", project.id)
            .success(function(files){
                var obj = {};
                obj.dir = files[0];
                projectFiles.model.projects[project.id] = obj;
                projectFiles.loadByMediaType(project);
                $scope.loaded = true;
            }).jsonp();
    }
}
