(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["processes", "templates", "$state", "mcmodal", "$filter", "filterProcess"];

    function projectListProcess(processes, templates, $state, mcmodal, $filter, filterProcess) {
        var ctrl = this;

        ctrl.viewProcess = viewProcess;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.processFilter = processFilter;
        ctrl.filterBy = 'all';

        ctrl.processes = processes;
        if (ctrl.processes.length !== 0) {
            ctrl.processes = $filter('orderBy')(ctrl.processes, 'name');
            ctrl.current = ctrl.processes[0];
            $state.go('projects.project.processes.list.view', {process_id: ctrl.current.id});
        }

        ///////////////////////////////////

        function viewProcess(process) {
            ctrl.current = process;
            $state.go('projects.project.processes.list.view', {process_id: ctrl.current.id});
        }

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project, templates).then(function (processTemplateName) {
                $state.go('projects.project.processes.create', {process: processTemplateName, process_id: ''});
            });
        }

        function processFilter(process) {
            if (!ctrl.searchText || ctrl.searchText === '') {
                return true;
            }

            var searchTextLC = ctrl.searchText.toLowerCase();
            switch (ctrl.filterBy) {
            case 'all':
                return filterProcess.byAll(process, searchTextLC);
                break;
            case 'processes':
                return filterProcess.byProcess(process, searchTextLC);
                break;
            case 'samples':
                return filterProcess.bySample(process, searchTextLC);
                break;
            default:
                return filterProcess.byAll(process, searchTextLC);
                break;
            }
        }
    }
}(angular.module('materialscommons')));
