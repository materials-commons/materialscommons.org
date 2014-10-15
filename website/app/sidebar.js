Application.Directives.directive("sidebar", sidebarDirective);

function sidebarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "sidebar.html",
        controller: "sidebarDirectiveController"
    };
}

Application.Controllers.controller("sidebarDirectiveController",
                                   ["$scope", "model.projects", "recent", "current",
                                    "sidebarUtil",
                                    sidebarDirectiveController]);

function sidebarDirectiveController($scope, projects, recent, current, sidebarUtil) {
    $scope.showAllRecent = false;

    projects.getList().then(function(p) {
        $scope.projects = p;
        $scope.project = $scope.projects[0];
        current.setProject($scope.project);
        $scope.project.fileCount = sidebarUtil.projectFileCount($scope.project);
        $scope.project.projectSize = sidebarUtil.projectSize($scope.project);
        $scope.recents = recent.getAll($scope.project.id);
    });
}
