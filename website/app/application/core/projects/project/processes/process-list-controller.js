(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["processes", "project", "$state", "modalInstance"];

    function projectListProcess(processes, project, $state, modalInstance) {
        var ctrl = this;

        ctrl.chooseTemplate = chooseTemplate;
        ctrl.viewProcess = viewProcess;

        ctrl.processes = processes;
        ctrl.project = project;
        ctrl.current = processes[0];
        if (processes.length > 0) {
            $state.go('projects.project.processes.list.view.setup', {process_id: ctrl.current.id});
        }
        function viewProcess(process) {
            ctrl.current = process;
            $state.go('projects.project.processes.list.view.setup', {process_id: ctrl.current.id});
        }

        function chooseTemplate() {
            modalInstance.chooseTemplate(ctrl.project);
        }
    }
}(angular.module('materialscommons')));
