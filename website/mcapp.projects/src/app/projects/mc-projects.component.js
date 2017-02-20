angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/projects/mc-projects.html',
    controller: MCProjectsComponentController
});

/*@ngInject*/
function MCProjectsComponentController(projectsService, $state, $mdDialog, sharedProjectsList, toast, User, mcbus) {
    var ctrl = this;
    ctrl.isOpen = true;
    ctrl.openProject = openProject;
    ctrl.projects = [];
    ctrl.sharingOn = false;
    ctrl.cancelSharing = cancelSharing;
    ctrl.gotoSharing = gotoSharing;
    ctrl.maxSharedProjects = 2;
    ctrl.user = User.u();
    sharedProjectsList.clearSharedProjects();
    sharedProjectsList.setMaxProjects(ctrl.maxSharedProjects);

    projectsService.getAllProjects().then(function(projects) {
        ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
        ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
    });

    mcbus.subscribe('PROJECTS$REFRESH', 'MCProjectsComponentController', () => {
        projectsService.getAllProjects().then(function(projects) {
            ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
            ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
        });
    });

    ctrl.createNewProject = () => {
        $mdDialog.show({
            templateUrl: 'app/projects/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => projectsService.getAllProjects().then(
                (projects) => {
                    ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
                    ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
                }
            )
        );
    };

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

    function cancelSharing() {
        sharedProjectsList.get().forEach(function(proj) {
            proj.selected = false;
        });
        sharedProjectsList.clearSharedProjects();
        ctrl.sharingOn = false;
    }

    function gotoSharing() {
        if (sharedProjectsList.count() < 2) {
            toast.error('You must select at least 2 projects');
        } else {
            $state.go('projects.share');
            ctrl.sharingOn = false;
        }
    }
}

class CreateNewProjectDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsService, toast) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectsService = projectsService;
        this.toast = toast;
    }

    submit() {
        if (this.name !== '') {
            this.projectsService.createProject(this.name, this.description)
                .then(
                    () => this.$mdDialog.hide(),
                    () => this.toast.error('Unable to create project')
                );
        }
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}