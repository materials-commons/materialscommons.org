Application.Directives.directive("filesList", filesListDirective);
function filesListDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/files/files-list.html"
    };
}
