Application.Directives.directive("addProjectsToSample", addProjectsToSampleDirective);

function addProjectsToSampleDirective() {
    return {
        replace: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/add-projects-to-sample.html"
    };
}
