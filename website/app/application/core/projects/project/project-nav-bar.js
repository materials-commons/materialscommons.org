(function (module) {
    module.directive("projectNavBar", projectNavBarDirective);

    function projectNavBarDirective() {
        return {
            restrict: "E",
            replace: true,
            bindToController: true,
            controller: "ProjectNavBarDirectiveController",
            controllerAs: 'ctrl',
            templateUrl: "application/core/projects/project/project-nav-bar.html"
        };
    }

    module.controller("ProjectNavBarDirectiveController", ProjectNavBarDirectiveController);
    ProjectNavBarDirectiveController.$inject = ["project", "$state"];

    /* @ngInject */
    function ProjectNavBarDirectiveController(project, $state) {
        var ctrl = this;
        ctrl.project = project.get().name;

        ctrl.setProject = setProject;

        //////////////////////////////

        function setProject(project) {
            current.setProject(project);
            $state.go("projects.project.home", {id: project.id});
        }
    }

}(angular.module('materialscommons')));
