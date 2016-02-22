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
        ctrl.openProject = openProject;
        ctrl.projects = [];
        projectsService.getAllProjects().then(function(projects) {
            ctrl.projects = projects;
        });

        function openProject(projectID) {
            console.log('openProject');
            $state.go('project.home', {project_id: projectID});
        }
    }
}(angular.module('materialscommons')));
