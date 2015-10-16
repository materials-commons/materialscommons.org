(function (module) {
    module.controller('projectProcesses', projectProcesses);
    projectProcesses.$inject = ["project", "processes", "$state", "$filter"];

    function projectProcesses(project, processes, $state, $filter) {
        var ctrl = this;

        ctrl.viewProcess = viewProcess;

        ctrl.processes = processes;
        ctrl.project = project;

        if (ctrl.processes.length !== 0) {
            var sortedProcesses= $filter('orderBy')(ctrl.processes, 'name');
            ctrl.current = sortedProcesses[0];
            $state.go('projects.project.processes.edit', {process_id: ctrl.current.id});
        }

        function viewProcess(process) {
            ctrl.current = process;
            $state.go('projects.project.processes.edit', {process_id: ctrl.current.id});
        }
    }

}(angular.module('materialscommons')));
