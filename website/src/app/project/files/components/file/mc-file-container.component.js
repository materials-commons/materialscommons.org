class MCFileContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, User, $stateParams, toast) {
        this.projectsAPI = projectsAPI;
        this.$stateParams = $stateParams;
        this.toast = toast;
        this.isBetaUser = User.isBetaUser();
        this.state = {
            file: null
        };
    }

    $onInit() {
        this.projectsAPI.getProjectFile(this.$stateParams.project_id, this.$stateParams.file_id).then(
            (file) => this.state.file = file,
            () => this.toast.error('Unable to retrieve file')
        );
    }
}

angular.module('materialscommons').component('mcFileContainer', {
    controller: MCFileContainerComponentController,
    template: `<mc-file file="$ctrl.state.file" is-beta-user="$ctrl.isBetaUser"></mc-file>`
});