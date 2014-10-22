Application.Directives.directive("sidebarProjects", sidebarProjectsDirective);

function sidebarProjectsDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "index/sidebar-projects.html",
        controller: "sidebarProjectsDirectiveController"
    };
}

Application.Controllers.controller("sidebarProjectsDirectiveController",
                                   ["$scope", "current", "sidebarUtil",
                                    "mcapi", "model.projects", "$state",
                                    sidebarProjectsDirectiveController]);

function sidebarProjectsDirectiveController($scope, current, sidebarUtil, mcapi, Projects, $state) {
    $scope.showProjects = false;

    $scope.setProject = function(project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $scope.project.fileCount = sidebarUtil.projectFileCount($scope.project);
        $scope.project.projectSize = sidebarUtil.projectSize($scope.project);
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.createProject = function(){
        if ($scope.model.name === "") {
            return;
        }
        mcapi('/projects')
            .success(function (data) {
                Projects.getList(true).then(function(projects) {
                    $scope.projects = projects;
                });
            }).post({'name': $scope.model.name});
    };
}
