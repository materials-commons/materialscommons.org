Application.Directives.directive("showProcessFiles", showProcessFilesDirective);
function showProcessFilesDirective() {
    return {
        scope: {
            files: "=files"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/provenance/show-process-files.html"
    };
}
