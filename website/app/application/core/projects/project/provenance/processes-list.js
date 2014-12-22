Application.Directives.directive("processesList", processesListDirective);
function processesListDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/provenance/processes-list.html"
    };
}
