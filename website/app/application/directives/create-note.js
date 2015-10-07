(function (module) {
    module.directive('createNote', createNoteDirective);
    function createNoteDirective() {
        return {
            restrict: "E",
            scope: {
                note: "=",
                save: "&",
                cancel: "&"
            },
            templateUrl: 'application/directives/create-note.html'
        };
    }
}(angular.module('materialscommons')));
