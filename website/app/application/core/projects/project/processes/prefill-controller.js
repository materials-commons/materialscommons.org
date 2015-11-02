(function (module) {
    module.controller('projectPreFillProcess', projectPreFillProcessController);
    projectPreFillProcessController.$inject = ["modal", "$modalInstance"];

    function projectPreFillProcessController(modal, $modalInstance) {
        var ctrl = this;

        ctrl.template = modal.template;
        ctrl.modal = modal;
        ctrl.ok = ok;
        ctrl.cancel = cancel;

        function ok() {
            $modalInstance.close({template: ctrl.template});
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }
}(angular.module('materialscommons')));
