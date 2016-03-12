(function (module) {
    module.component('mcProjectProcesses', {
        templateUrl: 'app/project/processes/mc-project-processes.html',
        controller: 'MCProjectProcessesComponentController'
    });

    module.controller('MCProjectProcessesComponentController', MCProjectProcessesComponentController);
    MCProjectProcessesComponentController.$inject = ['project', '$stateParams', '$state', '$filter'];
    function MCProjectProcessesComponentController(project, $stateParams, $state, $filter) {
        var ctrl = this;

        ctrl.processes = project.get().processes;

        if (!$stateParams.process_id && !$stateParams.template_id && ctrl.processes.length) {
            ctrl.processes = $filter('orderBy')(ctrl.processes, 'name');
            var firstProcess = ctrl.processes[0];
            $state.go('project.processes.process', {process_id: firstProcess.id});
        }

        ///////////////////////////
    }
}(angular.module('materialscommons')));
