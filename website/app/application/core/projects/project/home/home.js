(function (module) {
    module.controller('projectHome', projectHome);
    projectHome.$inject = ["project"];

    function projectHome(project, ui) {
        var ctrl = this;
        ctrl.project = project;
    }

}(angular.module('materialscommons')));
