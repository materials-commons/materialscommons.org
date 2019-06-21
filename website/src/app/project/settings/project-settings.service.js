class ProjectSettingsService {
    /*@ngInject*/
    constructor(projectsAPI, accessAPI, $mdDialog) {
        this.projectsAPI = projectsAPI;
        this.accessAPI = accessAPI;
        this.$mdDialog = $mdDialog;
    }

    transferProjectOwner(project) {
        this.projectsAPI.getProjectAccessEntries(project.id).then(
            users => {
                let projectUsers = users.filter(u => u.user_id !== project.owner);
                this.$mdDialog.show({
                    templateUrl: 'app/modals/transfer-project-owner-dialog.html',
                    controllerAs: '$ctrl',
                    controller: TransferProjectOwnerDialogController,
                    bindToController: true,
                    clickOutsideToClose: true,
                    multiple: true,
                    locals: {
                        project: project,
                        users: projectUsers,
                    }
                });
            }
        );
    }
}

class TransferProjectOwnerDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.state = {
            selectedUser: null,
        };
    }

    done() {
        this.projectsAPI.transferProjectOwner(this.project.id, this.state.selectedUser);
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('projectSettingsService', ProjectSettingsService);