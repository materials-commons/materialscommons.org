(function (module) {
    module.directive("projectNavBar", projectNavBarDirective);

    function projectNavBarDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                project: "=project",
                projects: "=projects"
            },
            bindToController: true,
            controller: "ProjectNavBarDirectiveController",
            controllerAs: 'ctrl',
            templateUrl: "application/core/projects/project/project-nav-bar.html"
        };
    }

    module.controller("ProjectNavBarDirectiveController", ProjectNavBarDirectiveController);
    ProjectNavBarDirectiveController.$inject = ["current", "$state"];

    /* @ngInject */
    function ProjectNavBarDirectiveController(current, $state) {
        var ctrl = this;

        ctrl.setProject = setProject;

        //////////////////////////////

        function setProject(project) {
            current.setProject(project);
            $state.go("projects.project.home", {id: project.id});
        }
    }

}(angular.module('materialscommons')));
