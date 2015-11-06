(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "modalInstance", "templates", "$state"];

    function ProjectHomeController(project, modalInstance, templates, $state) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.createSample = createSample;

        /////////////////////////

        function chooseTemplate() {
            modalInstance.chooseTemplate(ctrl.project, templates).then(function(processTemplateName) {
                $state.go('projects.project.processes.create', {process: processTemplateName});
            });
        }

        function createSample() {
            $state.go('projects.project.processes.create', {process: 'As Received'});
        }
    }
}(angular.module('materialscommons')));
