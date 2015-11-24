(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "mcmodal", "templates", "$state", "Restangular"];

    function ProjectHomeController(project, mcmodal, templates, $state, Restangular) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;
        ctrl.chooseExistingProcess = chooseExistingProcess;
        ctrl.templates = templates;
        ctrl.hasFavorites = _.partial(_.any, ctrl.templates, _.matchesProperty('favorite', true));

        /////////////////////////

        function chooseTemplate() {
            mcmodal.chooseTemplate(ctrl.project, templates).then(function (processTemplateName) {
                $state.go('projects.project.processes.create', {process: processTemplateName, process_id: ''});
            });
        }

        function chooseExistingProcess() {
            Restangular.one('v2').one("projects", project.id).one("processes").getList().then(function(processes) {
                mcmodal.chooseExistingProcess(processes).then(function (existingProcess) {
                    var processName = existingProcess.process_name ? existingProcess.process_name : 'TEM';
                    $state.go('projects.project.processes.create', {process: processName, process_id: existingProcess.id});
                });
            });
        }
    }
}(angular.module('materialscommons')));
