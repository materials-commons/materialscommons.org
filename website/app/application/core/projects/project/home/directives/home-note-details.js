Application.Directives.directive("homeNoteDetails", homeNoteDetailsDirective);
function homeNoteDetailsDirective() {
    return {
        restrict: "AE",
        scope: true,
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-note-details.html"
    };
}
