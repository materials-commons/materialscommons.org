export function existingProcessController(processes, $modalInstance) {
    'ngInject';

    var ctrl = this;

    ctrl.selectProcess = selectProcess;
    ctrl.dismiss = dismiss;
    ctrl.processes = processes;

    function selectProcess(process) {
        $modalInstance.close(process);
    }

    function dismiss() {
        $modalInstance.dismiss('cancel');
    }
}
