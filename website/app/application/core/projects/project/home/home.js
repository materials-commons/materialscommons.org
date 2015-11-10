(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "mcmodal", "templates", "$state"];

    function ProjectHomeController(project, mcmodal, templates, $state) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.chooseExistingProcess = chooseExistingProcess;
        ctrl.createSample = createSample;
        ctrl.useTemplate = useTemplate;
        ctrl.templates = templates;

        /////////////////////////

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project, templates).then(function(processTemplateName) {
                $state.go('projects.project.processes.create', {process: processTemplateName});
            });
        }

        function useTemplate(templateName) {
            $state.go('projects.project.processes.create', {process: templateName});
        }

        function createSample() {
            $state.go('projects.project.processes.create', {process: 'As Received'});
        }

        function chooseExistingProcess() {
            console.log('chooseExistingProcess');
        }
    }
}(angular.module('materialscommons')));
