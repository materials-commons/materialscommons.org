(function(module) {
    module.component('mcProjects', {
        templateUrl: 'components/projects/mc-projects.html',
        controller: 'MCProjectsComponentController'
    });

    module.controller('MCProjectsComponentController', MCProjectsComponentController);
    MCProjectsComponentController.$inject = ['projectsService', '$state'];
    function MCProjectsComponentController(projectsService, $state) {
        var ctrl = this;
        ctrl.isOpen = true;
        ctrl.projectsOpen = true;
        ctrl.showSidebar = true;
        ctrl.projects = [];
        projectsService.getAllProjects().then(function(projects) {
            ctrl.projects = projects;
        });

        ctrl.openProject = function(projectID) {
            $state.go('project.home', {project_id: projectID});
        };
    }
}(angular.module('materialscommons')));
