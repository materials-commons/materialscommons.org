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
                                   ["$scope", "model.projects", sidebarDirectiveController]);

function sidebarDirectiveController($scope, projects) {
    projects.getList().then(function(p) {
        $scope.projects = p;
        $scope.project = $scope.projects[0];
    });
}
