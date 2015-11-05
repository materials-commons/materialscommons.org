(function (module) {
    module.controller('EditProcessController', EditProcessController);
    EditProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$state", "process", "$modal"];

    function EditProcessController(Restangular, $stateParams, selectItems, $state, process, $modal) {
        var ctrl = this;

        ctrl.process = process;
        console.dir(ctrl.process);

    }

}(angular.module('materialscommons')));
