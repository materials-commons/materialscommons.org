Application.Directives.directive("addNotesToSample", addNotesToSampleDirective);

function addNotesToSampleDirective() {
    return {
        replace: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/add-note-to-sample.html"
    };
}
