(function (module) {
    module.controller('projectProcesses', projectProcesses);
    projectProcesses.$inject = [];

    function projectProcesses() {
        var ctrl = this;

        //ctrl.viewProcess = viewProcess;
        //ctrl.chooseTemplate = chooseTemplate;
        //
        //ctrl.processes = processes;
        //ctrl.project = project;
        //if (ctrl.processes.length !== 0) {
        //    var sortedProcesses= $filter('orderBy')(ctrl.processes, 'name');
        //    ctrl.current = sortedProcesses[0];
        //    $state.go('projects.project.processes.view', {process_id: ctrl.current.id});
        //}
        //
        //function viewProcess(process) {
        //    ctrl.current = process;
        //    $state.go('projects.project.processes.view', {process_id: ctrl.current.id});
        //}
        //
        //function chooseTemplate() {
        //    modalInstance.chooseTemplate(ctrl.project);
        //}
    }
}(angular.module('materialscommons')));
