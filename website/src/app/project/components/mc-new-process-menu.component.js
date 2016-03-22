angular.module('materialscommons').component('mcNewProcessMenu', {
    templateUrl: 'app/project/components/mc-new-process-menu.html',
    controller: MCNewProcessMenuComponentController,
    bindings: {
        buttonName: '@',
        buttonClass: '@',
        buttonIcon: '@'
    }
});

/*@ngInject*/
function MCNewProcessMenuComponentController(templates, project, projectsService, mcmodal, $state) {
    var ctrl = this;
    console.log('buttonClass', ctrl.buttonClass);
    ctrl.templates = templates.get();
    ctrl.chooseTemplate = chooseTemplate;
    ctrl.chooseExistingProcess = chooseExistingProcess;
    ctrl.hasFavorites = _.partial(_.any, ctrl.templates, _.matchesProperty('favorite', true));

    /////////////////////////

    function chooseTemplate() {
        var proj = project.get();
        mcmodal.chooseTemplate(proj, ctrl.templates).then(function(processTemplateName) {
            $state.go('project.create.process', {template_id: processTemplateName, process_id: ''});
        });
    }

    function chooseExistingProcess() {
        var projectID = project.get().id;
        projectsService.getProjectProcesses(projectID).then(function(processes) {
            mcmodal.chooseExistingProcess(processes).then(function(existingProcess) {
                $state.go('project.create.process',
                    {template_id: existingProcess.process_name, process_id: existingProcess.id});
            });
        });
    }
}

