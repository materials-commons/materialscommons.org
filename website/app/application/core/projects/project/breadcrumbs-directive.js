Application.Directives.directive("breadcrumbs", breadcrumbsDirective);
function breadcrumbsDirective() {
    return {
        scope: {
            project: "=project"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/breadcrumbs.html",
        controller: "breadcrumbsDirectiveController"
    };
}

Application.Controllers.controller("breadcrumbsDirectiveController",
                                   ["$scope", "breadcrumbs",
                                    breadcrumbsDirectiveController]);
function breadcrumbsDirectiveController($scope, breadcrumbs) {
    var project = $scope.project;
    breadcrumbs.createProject(project.id, project.name);
    breadcrumbs.clear(project.id);
    breadcrumbs.append(project.id, "Home");

    $scope.breadcrumbs = breadcrumbs.get(project.id);
    console.dir($scope.breadcrumbs);
}
