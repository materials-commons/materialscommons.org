angular.module('materialscommons').component('mcProcess', {
    template: require('./mc-process.html'),
    controller: MCProcessComponentController
});

/*@ngInject*/
function MCProcessComponentController(mcstate, $state, $stateParams) {
    const ctrl = this;
    ctrl.process = mcstate.get(mcstate.CURRENT$PROCESS);
    ctrl.edit = edit;

    ///////////////////

    function edit() {
        $state.go('project.processes.edit', {process_id: $stateParams.process_id});
    }
}
