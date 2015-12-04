(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["processes", "project", "templates", "$state", "mcmodal", "$filter"];

    function projectListProcess(processes, project, templates, $state, mcmodal, $filter) {
        var ctrl = this;

        ctrl.viewProcess = viewProcess;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.processFilter = processFilter;
        ctrl.filterBy = 'all';

        ctrl.processes = processes;
        ctrl.project = project;
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

        function processFilter(value) {
            if (!ctrl.searchText || ctrl.searchText === '') {
                return true;
            }

            var searchTextLC = ctrl.searchText.toLowerCase();
            switch (ctrl.filterBy) {
            case 'all':
                return filterByAll(value, searchTextLC); break;
            case 'processes':
                return filterByProcesses(value, searchTextLC); break;
            case 'samples':
                return filterBySamples(value, searchTextLC); break;
            default:
                return filterByAll(value, searchTextLC); break;
            }
        }

        function filterByAll(process, searchText) {
            if (filterByProcesses(process, searchText)) {
                return true;
            }

            return filterBySamples(process, searchText);
        }

        function filterBySamples(process, searchText) {
            for (var i = 0; i < process.samples.length; i++) {
                var sample = process.samples[i];
                if (sample.name.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                } else if (sample.description && sample.description.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                }
            }
            return false;
        }

        function filterByProcesses(process, searchText) {
            if (process.name.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.what.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.why.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.setup.length && process.setup[0].properties.length) {
                for (var i = 0; i < process.setup[0].properties.length; i++) {
                    var item = process.setup[0].properties[i];
                    if (item.name.toLowerCase().indexOf(searchText) !== -1) {
                        return true;
                    } else if (item._type === 'selection' && item.value !== "") {
                        if (item.value.name && item.value.name.toLowerCase().indexOf(searchText) !== -1) {
                            return true;
                        } else if (!item.value.name && item.value.toLowerCase().indexOf(searchText) !== -1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }
}(angular.module('materialscommons')));
