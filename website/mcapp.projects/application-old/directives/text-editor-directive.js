(function (module) {
    module.directive("textEditor", textEditorDirective);

    function textEditorDirective() {
        return {
            scope: {
                text: "="
            },
            restrict: "E",
            templateUrl: "application/directives/text-editor.html"
        };
    }
}(angular.module('materialscommons')));
