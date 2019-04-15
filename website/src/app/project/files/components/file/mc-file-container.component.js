class MCFileContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, projectFileTreeAPI, experimentsAPI, User, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.experimentsAPI = experimentsAPI;
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

    handleEtlFile(experimentName) {
        this.experimentsAPI.createExperimentFromSpreadsheet(experimentName, this.state.file.id, this.$stateParams.project_id);
    }
}

angular.module('materialscommons').component('mcFileContainer', {
    controller: MCFileContainerComponentController,
    template: `<mc-file ng-if="$ctrl.state.file" 
                        file="$ctrl.state.file" 
                        is-beta-user="$ctrl.isBetaUser" 
                        on-etl-file="$ctrl.handleEtlFile(experimentName)"
                        on-rename-file="$ctrl.handleRenameFile(name)"></mc-file>`
});