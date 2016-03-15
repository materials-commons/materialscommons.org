angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/projects/mc-projects.html',
    controller: MCProjectsComponentController
});

function MCProjectsComponentController(projectsService, $state, $mdSidenav, sharedProjectsList, toastr) {
    'ngInject';

    var ctrl = this;
    ctrl.isOpen = true;
    ctrl.openProject = openProject;
    ctrl.projects = [];
    ctrl.toggleSidenav = toggleSidenav;
    ctrl.newProjectName = '';
    ctrl.newProjectDescription = '';
    ctrl.cancel = cancel;
    ctrl.create = create;
    ctrl.sharingOn = false;
    ctrl.cancelSharing = cancelSharing;
    ctrl.gotoSharing = gotoSharing;
    ctrl.maxSharedProjects = 3;
    sharedProjectsList.clearSharedProjects();
    sharedProjectsList.setMaxProjects(ctrl.maxSharedProjects);

    projectsService.getAllProjects().then(function(projects) {
        ctrl.projects = projects;
    });

    ///////////////////////

    function openProject(project) {
        if (ctrl.sharingOn) {
            if (sharedProjectsList.isFull() && !project.selected) {
                // Adding project, but the list is full, so delete the last item.
                var removed = sharedProjectsList.removeLast();
                removed.selected = false;
            }

            project.selected = !project.selected;

            if (project.selected) {
                sharedProjectsList.addProject(project);
            } else {
                // Project was deselected
                sharedProjectsList.removeProject(project);
            }
        } else {
            $state.go('project.home', {project_id: project.id});
        }
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

    function cancelSharing() {
        sharedProjectsList.get().forEach(function(proj) {
            proj.selected = false;
        });
        sharedProjectsList.clearSharedProjects();
        ctrl.sharingOn = false;
    }

    function gotoSharing() {
        if (sharedProjectsList.count() < 2) {
            toastr.error('You must select at least 2 projects', 'Error', {closeButton: true});
        } else {
            $state.go('projects.share');
            ctrl.sharingOn = false;
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