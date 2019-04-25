class MCFileContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, projectFileTreeAPI, experimentsAPI, User, $mdDialog, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.experimentsAPI = experimentsAPI;
        this.$mdDialog = $mdDialog;
        this.$stateParams = $stateParams;
        this.isBetaUser = User.isBetaUser();
        this.state = {
            file: null
        };
    }

    $onInit() {
        this.projectsAPI.getFileInProject(this.$stateParams.file_id, this.$stateParams.project_id).then(
            (file) => this.state.file = file
        );
    }

    handleRenameFile(name) {
        this.projectFileTreeAPI.renameFileInProject(this.state.file.id, this.$stateParams.project_id, name).then(
            file => this.state.file = angular.copy(file)
        );
    }

    handleEtlFile(experimentName, hasParent) {
        this.experimentsAPI.checkSpreadsheet(this.state.file.id, this.$stateParams.project_id, experimentName, hasParent).then(
            status => this.showStatus(status).then(
                () => {
                    this.$mdDialog.show(
                        this.$mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('ETL Jobs Run In Background')
                            .textContent('Your spreadsheet will be loaded in the background. Press sync to check on progress.')
                            .ariaLabel('ETL Background Dialog')
                            .ok('Ok')
                    );
                    this.experimentsAPI.createExperimentFromSpreadsheet(experimentName, this.state.file.id, this.$stateParams.project_id, hasParent);
                }
            ),
            e => this.showStatus(e)
        );
    }

    showStatus(status) {
        let logSplit = status.output.split('\n');
        return this.$mdDialog.show({
            templateUrl: 'app/modals/etl-output-dialog.html',
            controller: CloseDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                log: logSplit,
                isSuccess: status.success,
            }
        });
    }
}

angular.module('materialscommons').component('mcFileContainer', {
    controller: MCFileContainerComponentController,
    template: `<mc-file ng-if="$ctrl.state.file" 
                        file="$ctrl.state.file" 
                        is-beta-user="$ctrl.isBetaUser" 
                        on-etl-file="$ctrl.handleEtlFile(experimentName, hasParent)"
                        on-rename-file="$ctrl.handleRenameFile(name)"></mc-file>`
});

class CloseDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    submit() {
        this.$mdDialog.hide();
    }

    close() {
        this.$mdDialog.cancel();
    }
}