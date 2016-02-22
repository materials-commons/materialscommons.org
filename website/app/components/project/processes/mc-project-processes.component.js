(function (module) {
    module.component('mcProjectProcesses', {
        templateUrl: 'components/project/processes/mc-project-processes.html',
        controller: 'MCProjectProcessesComponentController'
    });

    module.controller('MCProjectProcessesComponentController', MCProjectProcessesComponentController);
    MCProjectProcessesComponentController.$inject = ["project"];
    function MCProjectProcessesComponentController(project) {
        var ctrl = this;

        ctrl.processes = project.get().processes;

        ///////////////////////////
    }
}(angular.module('materialscommons')));
