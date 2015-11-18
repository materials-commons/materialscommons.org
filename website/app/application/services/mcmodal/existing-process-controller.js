(function (module) {
    module.controller('existingProcessController', existingProcessController);
    existingProcessController.$inject = ["processes", "$modalInstance"];

    function existingProcessController(processes, $modalInstance) {
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
}(angular.module('materialscommons')));