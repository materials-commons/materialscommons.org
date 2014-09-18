Application.Directives.directive('actionCreateNote', actionCreateNote);

function actionCreateNote() {
    return {
        scope: {
            project: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-note.html"
    };
}
