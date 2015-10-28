(function (module) {
    module.controller('projectPreFillProcess', projectPreFillProcessController);
    projectPreFillProcessController.$inject = ["template"];

    function projectPreFillProcessController(template) {
        var ctrl = this;
        ctrl.template = template;

        //ctrl.setUp = setUp;
    }
}(angular.module('materialscommons')));
