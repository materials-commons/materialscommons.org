(function (module) {
    module.component('mcProjectHome', {
       templateUrl: 'project/home/mc-project-home.html',
        controller: 'MCProjectHomeComponentController'
    });

    module.controller('MCProjectHomeComponentController', MCProjectHomeComponentController);
    MCProjectHomeComponentController.$inject = ["$state", "project"];

    function MCProjectHomeComponentController($state, project) {
        var ctrl = this;
        ctrl.project = project.get();
        ctrl.projectLoaded = true;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.chooseExistingProcess = chooseExistingProcess;
        ctrl.templates = []; // templates;
        ctrl.hasFavorites = []; //_.partial(_.any, ctrl.templates, _.matchesProperty('favorite', true));

        /////////////////////////

        function chooseTemplate() {
            //mcmodal.chooseTemplate(ctrl.project, templates).then(function (processTemplateName) {
            //    $state.go('projects.project.processes.create', {process: processTemplateName, process_id: ''});
            //});
            console.log('chooseTemplate');
            $state.go('project.processes.create', {template_id: 'As Received', process_id:''});
        }

        function chooseExistingProcess() {
            projectsService.getProjectProcesses(project.id).then(function (processes) {
                mcmodal.chooseExistingProcess(processes).then(function (existingProcess) {
                    $state.go('projects.project.processes.create',
                        {process: existingProcess.process_name, process_id: existingProcess.id});
                });
            });
        }
    }
}(angular.module('materialscommons')));
