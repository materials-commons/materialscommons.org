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
        ctrl.newProjectName = '';
        ctrl.newProjectDescription = '';
        ctrl.cancel = cancel;
        ctrl.create = create;

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

        function create() {
            if (ctrl.newProjectName !== '') {
                projectsService.createProject(ctrl.newProjectName, ctrl.newProjectDescription)
                .then(
                    function success() {
                        toggleSidenav();
                        clearNewProjectVars();
                        projectsService.getAllProjects().then(function(projects) {
                            ctrl.projects = projects;
                        });
                    },

                    function error(err) {
                        console.log('error', err);
                    }
                );
            }
        }

        function cancel() {
            toggleSidenav();
            clearNewProjectVars();
        }

        function clearNewProjectVars() {
            ctrl.newProjectName = '';
            ctrl.newProjectDescription = '';
        }
    }
}(angular.module('materialscommons')));
