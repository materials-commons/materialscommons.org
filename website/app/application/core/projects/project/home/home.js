(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "modalInstance"];

    function ProjectHomeController(project, modalInstance) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.chooseTemplate = chooseTemplate;

        /////////////////////////

        function chooseTemplate() {
            modalInstance.chooseTemplate(ctrl.project);
        }
    }
}(angular.module('materialscommons')));
