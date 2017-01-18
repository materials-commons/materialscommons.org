angular.module('materialscommons').component('mcProcess', {
    templateUrl: 'app/project/processes/process/mc-process.html',
    controller: MCProcessComponentController
});

/*@ngInject*/
function MCProcessComponentController(mcreg, $state, $stateParams) {
    const ctrl = this;
    ctrl.process = mcreg.current$process;
    ctrl.edit = edit;

    ///////////////////

    function edit() {
        $state.go('project.processes.edit', {process_id: $stateParams.process_id});
    }
}