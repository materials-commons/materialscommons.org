(function (module) {
    module.controller('projectViewProcess', projectViewProcess);
    projectViewProcess.$inject = ["$state", "process"];

    function projectViewProcess($state, process) {
        var ctrl = this;
        ctrl.editProvenance = editProvenance;
        ctrl.process = process;

        function editProvenance() {
            $state.go('projects.project.processes.edit', {process_id: ctrl.process.id});
        }
    }
}(angular.module('materialscommons')));
