(function (module) {
    module.component('mcProjectHome', {
       templateUrl: 'project/home/mc-project-home.html',
        controller: 'MCProjectHomeComponentController'
    });

    module.controller('MCProjectHomeComponentController', MCProjectHomeComponentController);
    MCProjectHomeComponentController.$inject = ['$state', 'project', 'templates', 'mcmodal', 'projectsService'];

    function MCProjectHomeComponentController($state, project, templates, mcmodal, projectsService) {
        var ctrl = this;
        ctrl.project = project.get();
        ctrl.projectLoaded = true;
        ctrl.templates = templates.get();
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.chooseExistingProcess = chooseExistingProcess;
        ctrl.hasFavorites = _.partial(_.any, ctrl.templates, _.matchesProperty('favorite', true));

        /////////////////////////

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project, ctrl.templates).then(function (processTemplateName) {
                $state.go('project.processes.create', {template_id: processTemplateName, process_id: ''});
            });
        }

        function chooseExistingProcess() {
            projectsService.getProjectProcesses(ctrl.project.id).then(function (processes) {
                mcmodal.chooseExistingProcess(processes).then(function (existingProcess) {
                    $state.go('project.processes.create',
                        {template_id: existingProcess.process_name, process_id: existingProcess.id});
                });
            });
        }
    }
}(angular.module('materialscommons')));
