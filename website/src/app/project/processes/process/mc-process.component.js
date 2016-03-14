(function (module) {
    module.component('mcProcess', {
        templateUrl: 'app/project/processes/process/mc-process.html',
        controller: 'MCProcessComponentController'
    });

    module.controller('MCProcessComponentController', MCProcessComponentController);
    MCProcessComponentController.$inject = ['process', '$state', '$stateParams'];
    function MCProcessComponentController(process, $state, $stateParams) {
        var ctrl = this;
        ctrl.process = process.get();
        ctrl.edit = edit;

        ///////////////////

        function edit() {
            $state.go('project.processes.edit', {process_id: $stateParams.process_id});
        }
    }
}(angular.module('materialscommons')));
