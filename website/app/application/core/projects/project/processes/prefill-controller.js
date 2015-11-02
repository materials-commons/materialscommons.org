(function (module) {
    module.controller('projectPreFillProcess', projectPreFillProcessController);
    projectPreFillProcessController.$inject = ["modal"];

    function projectPreFillProcessController(modal) {
        var ctrl = this;
        ctrl.template = modal.template;
        ctrl.modal = modal;

        console.log('in side controller');
        ctrl.ok = ok;
        ctrl.cancel = cancel;

        //console.dir(ctrl.template);
        //ctrl.setUp = setUp;
        //
        function ok() {
            console.log('ok');
            ctrl.modal.instance.close();
        }

        function cancel() {
            ctrl.modal.instance.dismiss('cancel');
        }

    }
}(angular.module('materialscommons')));
