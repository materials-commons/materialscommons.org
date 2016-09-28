(function(module) {
    module.directive('notesList', notesListDirective);
    function notesListDirective() {
        return {
            restrict: 'E',
            scope: {
                notes: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/notes-list.html'
        };
    }
}(angular.module('materialscommons')));

