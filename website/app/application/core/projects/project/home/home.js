(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["$state", "projectsService", "$stateParams", "model.projects"];

    function ProjectHomeController($state, projectsService, $stateParams, projects) {
        var ctrl = this;

        projects.get($stateParams.id).then(function(p) {
            ctrl.projectLoaded = true;
            ctrl.project = p;
        });
        //ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.chooseExistingProcess = chooseExistingProcess;
        ctrl.templates = []; // templates;
        ctrl.hasFavorites = []; //_.partial(_.any, ctrl.templates, _.matchesProperty('favorite', true));

        /////////////////////////

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project, templates).then(function (processTemplateName) {
                $state.go('projects.project.processes.create', {process: processTemplateName, process_id: ''});
            });
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
