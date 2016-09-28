(function (module) {
    module.directive("displayNote", displayNoteDirective);
    function displayNoteDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                note: "=note",
                showSideboard: "=showSideboard"
            },
            controller: "DisplayNoteDirectiveController",
            controllerAs: 'note',
            bindToController: true,
            templateUrl: "application/core/projects/project/home/directives/display-note.html"
        };
    }

    module.controller("DisplayNoteDirectiveController", DisplayNoteDirectiveController);
    DisplayNoteDirectiveController.$inject = [];

    /* @ngInject */
    function DisplayNoteDirectiveController() {
        var ctrl = this;
    }

}(angular.module('materialscommons')));
