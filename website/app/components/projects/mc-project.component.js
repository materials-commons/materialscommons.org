(function(module) {
    module.component('mcProjects', {
        templateUrl: 'components/projects/mc-projects.html',
        controller: 'MCProjectsComponentController'
    });

    module.controller('MCProjectsComponentController', MCProjectsComponentController);
    MCProjectsComponentController.$inject = ['model.projects', '$state'];
    function MCProjectsComponentController(projectsService, $state) {
        console.log('MCProjectsComponentController');
        var ctrl = this;
        ctrl.isOpen = true;
        ctrl.projectsOpen = false;
        ctrl.showSidebar = true;
        ctrl.projects = [];
        projectsService.getList().then(function(projects) {
            ctrl.projects = projects;
        });

        ctrl.openProject = function(projectID) {
            $state.go('projects.project', {id: projectID});
        };
    }
}(angular.module('materialscommons')));
