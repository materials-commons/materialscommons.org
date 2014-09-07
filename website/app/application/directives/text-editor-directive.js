Application.Directives.directive("textEditor", textEditorDirective);

function textEditorDirective() {
    return {
        scope: {
            text: "="
        },
        restrict: "E",
        templateUrl: "application/directives/text-editor.html"
    };
}
