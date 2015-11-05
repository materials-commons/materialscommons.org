(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "modalInstance", "processTemplates", "$state"];

    function ProjectHomeController(project, modalInstance, processTemplates, $state) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.createSample = createSample;

        /////////////////////////

        function chooseTemplate() {
            modalInstance.chooseTemplate(ctrl.project);
        }

        function createSample() {
            var template = processTemplates.getTemplateByName('As Received');
            processTemplates.setActiveTemplate(template);
            $state.go('projects.project.processes.create');
        }
    }
}(angular.module('materialscommons')));
