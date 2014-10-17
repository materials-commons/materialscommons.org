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
                                    "mcapi", "model.projects",
                                    sidebarProjectsDirectiveController]);

function sidebarProjectsDirectiveController($scope, current, sidebarUtil, mcapi, Projects) {
    $scope.showProjects = false;

    $scope.setProject = function(project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $scope.project.fileCount = sidebarUtil.projectFileCount($scope.project);
        $scope.project.projectSize = sidebarUtil.projectSize($scope.project);
    };

    $scope.createProject = function(){
        if ($scope.model.name === "") {
            return;
        }
        mcapi('/projects')
            .success(function (data) {
                console.dir(data);
                Projects.getList(true).then(function(projects) {
                    $scope.projects = projects;
                });
            }).post({'name': $scope.model.name});
    };
}
