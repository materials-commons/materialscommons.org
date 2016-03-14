(function (module) {
    module.controller('setupViewController', setupViewController);
    setupViewController.$inject = ["template", "$modalInstance"];

    function setupViewController(template, $modalInstance) {
        var ctrl = this;

        ctrl.dismiss = dismiss;
        ctrl.template = template.create();
        ctrl.properties = ctrl.template.setup.settings[0].properties;

        function dismiss() {
            $modalInstance.dismiss('cancel');
        }
    }
}(angular.module('materialscommons')));