class MCFileContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, User, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.$stateParams = $stateParams;
        this.isBetaUser = User.isBetaUser();
        this.state = {
            file: null
        };
    }

    $onInit() {
        // this.projectsAPI.getProjectFile(this.$stateParams.project_id, this.$stateParams.file_id).then(
        this.projectsAPI.getFileInProject(this.$stateParams.file_id, this.$stateParams.project_id).then(
            (file) => this.state.file = file,
        );
    }
}

angular.module('materialscommons').component('mcFileContainer', {
    controller: MCFileContainerComponentController,
    template: `<mc-file ng-if="$ctrl.state.file" file="$ctrl.state.file" is-beta-user="$ctrl.isBetaUser"></mc-file>`
});