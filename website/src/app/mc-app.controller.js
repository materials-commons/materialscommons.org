export class MCAppController {
    constructor(User, $stateParams) {
        'ngInject';
        this.isAuthenticated = User.isAuthenticated;
        this.$stateParams = $stateParams;
    }

    inProject() {
        return this.$stateParams.project_id;
    }
}

