(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["processes", "project", "$state", "modalInstance"];

    function projectListProcess(processes, project, $state, modalInstance) {
        var processListCtrl = this;

        processListCtrl.chooseTemplate = chooseTemplate;
        processListCtrl.viewProcess = viewProcess;

        processListCtrl.processes = processes;
        processListCtrl.project = project;
        processListCtrl.current = {};
        if (processListCtrl.processes.length !== 0) {
            processListCtrl.current = processListCtrl.processes[0];
        }

         function viewProcess(process) {
            processListCtrl.current = process;
            $state.go('projects.project.processes.list.view.setup', {process_id: processListCtrl.current.id});
        }

        function chooseTemplate() {
            modalInstance.chooseTemplate(processListCtrl.project);
        }
    }
}(angular.module('materialscommons')));
