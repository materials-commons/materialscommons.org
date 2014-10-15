Application.Directives.directive("sidebarProjects", sidebarProjectsDirective);

function sidebarProjectsDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "sidebar-projects.html",
        controller: "sidebarProjectsDirectiveController"
    };
}

Application.Controllers.controller("sidebarProjectsDirectiveController",
                                   ["$scope", "current", "sidebarUtil",
                                    sidebarProjectsDirectiveController]);

function sidebarProjectsDirectiveController($scope, current, sidebarUtil) {
    $scope.showProjects = false;

    $scope.setProject = function(project) {
        console.log("setProject called");
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $scope.project.fileCount = sidebarUtil.projectFileCount($scope.project);
        $scope.project.projectSize = sidebarUtil.projectSize($scope.project);
    };
}
