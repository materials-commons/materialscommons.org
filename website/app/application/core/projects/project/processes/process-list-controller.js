(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["processes", "project", "$state", "mcmodal", "$filter"];

    function projectListProcess(processes, project, $state, mcmodal, $filter) {
        console.log('projectListProcess');
        var ctrl = this;

        ctrl.viewProcess = viewProcess;
        ctrl.chooseTemplate = chooseTemplate;

        ctrl.processes = processes;
        ctrl.project = project;
        if (ctrl.processes.length !== 0) {
            console.log('  ctrl.processes.length !== 0');
            ctrl.processes = $filter('orderBy')(ctrl.processes, 'name');
            ctrl.current = ctrl.processes[0];
            //$state.go('projects.project.processes.list.view', {process_id: ctrl.current.id});
        }

        ///////////////////////////////////

        function viewProcess(process) {
            ctrl.current = process;
            $state.go('projects.project.processes.list.view', {process_id: ctrl.current.id});
        }

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project);
        }
    }
}(angular.module('materialscommons')));
