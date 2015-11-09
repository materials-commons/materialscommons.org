(function (module) {
    module.controller('setupViewController', setupViewController);
    setupViewController.$inject = ["properties", "$modalInstance"];

    function setupViewController(properties, $modalInstance) {
        var ctrl = this;
        ctrl.dismiss = dismiss;
        ctrl.properties = properties;

        function dismiss() {
            $modalInstance.dismiss('cancel');
        }
    }
}(angular.module('materialscommons')));