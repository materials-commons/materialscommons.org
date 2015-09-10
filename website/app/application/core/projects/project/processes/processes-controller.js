(function (module) {
    module.controller('projectProcesses', projectProcesses);
    projectProcesses.$inject = ["project"];

    function projectProcesses(project) {
        this.all = project.processes;
    }

}(angular.module('materialscommons')));
