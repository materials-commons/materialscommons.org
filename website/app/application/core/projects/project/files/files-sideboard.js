Application.Directives.directive("filesSideboard", filesSideboardDirective);
function filesSideboardDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/files/files-sideboard.html"
    };
}
