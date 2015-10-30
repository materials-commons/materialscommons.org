(function (module) {
    module.controller('projectPreFillProcess', projectPreFillProcessController);
    projectPreFillProcessController.$inject = ["modal"];

    function projectPreFillProcessController(modal) {
        var ctrl = this;
        ctrl.template = modal.template;
        console.dir(ctrl.template);
        //ctrl.setUp = setUp;
    }
}(angular.module('materialscommons')));
