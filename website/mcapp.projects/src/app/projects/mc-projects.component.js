angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/projects/mc-projects.html',
    controller: MCProjectsComponentController
});

/*@ngInject*/
function MCProjectsComponentController($state, $mdDialog, sharedProjectsList, toast, User, mcbus, ProjectModel, mcshow, $mdEditDialog) {
    const ctrl = this;
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
    ctrl.sortOrderMine = 'name';
    ctrl.sortOrderJoined = 'name';
    ctrl.showProjectOverview = (project) => mcshow.projectOverviewDialog(project);

    getUserProjects();

    mcbus.subscribe('PROJECTS$REFRESH', 'MCProjectsComponentController', () => {
        getUserProjects();
    });

    ctrl.createNewProject = () => {
        $mdDialog.show({
            templateUrl: 'app/projects/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => getUserProjects()
        );
    };

    ctrl.editStatusNote = (event, project) => {
        event.stopPropagation();
        $mdEditDialog.small({
            modelValue: project.msg1,
            placeholder: 'Add status message',
            save: function (input) {
                project.msg1 = input.$modelValue;
            },
            targetEvent: event
        });
    };

    /*
     $scope.editComment = function (event, dessert) {
     // if auto selection is enabled you will want to stop the event
     // from propagating and selecting the row
     event.stopPropagation();


     var promise = $mdEditDialog.small({
     // messages: {
     //   test: 'I don\'t like tests!'
     // },
     modelValue: dessert.comment,
     placeholder: 'Add a comment',
     save: function (input) {
     dessert.comment = input.$modelValue;
     },
     targetEvent: event,
     validators: {
     'md-maxlength': 30
     }
     });
     */

    ///////////////////////

    function getUserProjects() {
        ProjectModel.getProjectsForCurrentUser().then(
            (projects) => {
                ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
                ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
            }
        );
    }

    function openProject(project) {
        if (ctrl.sharingOn) {
            if (sharedProjectsList.isFull() && !project.selected) {
                // Adding project, but the list is full, so delete the last item.
                let removed = sharedProjectsList.removeLast();
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
    constructor($mdDialog, projectsAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    submit() {
        if (this.name !== '') {
            this.projectsAPI.createProject(this.name, this.description)
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