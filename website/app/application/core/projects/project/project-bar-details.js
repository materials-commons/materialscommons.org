Application.Directives.directive('projectBarDetails', projectBarDetailsDirective);

function projectBarDetailsDirective() {
    return {
        scope: {
            project: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-bar-details.html"
    };
}
