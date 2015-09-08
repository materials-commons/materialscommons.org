(function (module) {
    module.controller('projectNotes', projectNotes);
    projectNotes.$inject = ["project"];

    function projectNotes(project) {
        var ctrl = this;

        ctrl.project = project;
    }

}(angular.module('materialscommons')));
