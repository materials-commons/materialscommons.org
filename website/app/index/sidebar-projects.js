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
                                   ["$scope", "current", "$state",
                                    sidebarProjectsDirectiveController]);

function sidebarProjectsDirectiveController($scope, current, $state) {
    $scope.showProjects = false;

    $scope.setProject = function(project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };
}
