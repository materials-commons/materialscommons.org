(function (module) {
    module.directive("homeNoteDetails", homeNoteDetailsDirective);
    function homeNoteDetailsDirective() {
        return {
            restrict: "AE",
            scope: true,
            replace: true,
            templateUrl: "home-note-details.html"
        };
    }
}(angular.module('materialscommons')));
