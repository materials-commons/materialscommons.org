angular.module('materialscommons').component('mcProcess', {
    templateUrl: 'app/project/processes/process/mc-process.html',
    controller: MCProcessComponentController
});

function MCProcessComponentController(process, $state, $stateParams) {
    'ngInject';

    var ctrl = this;
    ctrl.process = process.get();
    ctrl.edit = edit;

    ///////////////////

    function edit() {
        $state.go('project.processes.edit', {process_id: $stateParams.process_id});
    }
}