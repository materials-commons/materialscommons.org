(function(module) {
    module.component('mcProjects', {
        templateUrl: 'components/projects/mc-projects.html',
        controller: 'MCProjectsComponentController'
    });

    module.controller('MCProjectsComponentController', MCProjectsComponentController);
    MCProjectsComponentController.$inject = ['projectsService', '$state', '$mdSidenav'];
    function MCProjectsComponentController(projectsService, $state, $mdSidenav) {
        var ctrl = this;
        ctrl.isOpen = true;
        ctrl.openProject = openProject;
        ctrl.projects = [];
        ctrl.toggleSidenav = toggleSidenav;

        projectsService.getAllProjects().then(function(projects) {
            ctrl.projects = projects;
        });

        ///////////////////////

        function openProject(projectID) {
            $state.go('project.home', {project_id: projectID});
        }

        function toggleSidenav() {
            $mdSidenav('createProject').toggle();
        }
    }
}(angular.module('materialscommons')));
