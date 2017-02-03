export class MCAppController {
    constructor(User, $stateParams) {
        'ngInject';
        this.isAuthenticated = User.isAuthenticated;
        this.$stateParams = $stateParams;
        this.items = [];
        for (let i = 0; i < 1000; i++) {
           this.items.push(i);
        }
    }

    inProject() {
        return this.$stateParams.project_id;
    }
}

