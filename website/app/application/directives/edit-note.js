(function (module) {
    module.directive('editNote', editNoteDirective);
    function editNoteDirective() {
        return {
            restrict: "E",
            scope: {
                note: "=",
                save: "&",
                cancel: "&"
            },
            templateUrl: 'application/directives/edit-note.html'
        };
    }
}(angular.module('materialscommons')));
