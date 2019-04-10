class MCFileContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, projectFileTreeAPI, User, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.$stateParams = $stateParams;
        this.isBetaUser = User.isBetaUser();
        this.state = {
            file: null
        };
    }

    $onInit() {
        // this.projectsAPI.getProjectFile(this.$stateParams.project_id, this.$stateParams.file_id).then(
        this.projectsAPI.getFileInProject(this.$stateParams.file_id, this.$stateParams.project_id).then(
            (file) => this.state.file = file
        );
    }

    handleRenameFile(name) {
        this.projectFileTreeAPI.renameFileInProject(this.state.file.id, this.$stateParams.project_id, name).then(
            file => this.state.file = angular.copy(file)
        );
    }
}

angular.module('materialscommons').component('mcFileContainer', {
    controller: MCFileContainerComponentController,
    template: `<mc-file ng-if="$ctrl.state.file" file="$ctrl.state.file" is-beta-user="$ctrl.isBetaUser" on-rename-file="$ctrl.handleRenameFile(name)"></mc-file>`
});