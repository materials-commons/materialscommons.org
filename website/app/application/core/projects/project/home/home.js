(function (module) {
    module.controller('projectHome', projectHome);
    projectHome.$inject = ["project"];

    function projectHome(project) {
        var ctrl = this;
        ctrl.project = project;
    }

}(angular.module('materialscommons')));
