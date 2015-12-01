(function (module) {
    module.controller('projectViewProcess', projectViewProcess);
    projectViewProcess.$inject = ["process"];

    function projectViewProcess(process) {
        var ctrl = this;
        ctrl.process = process;
    }
}(angular.module('materialscommons')));
