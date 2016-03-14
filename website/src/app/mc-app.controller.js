export class MCAppController {
    constructor(User) {
        'ngInject';
        this.isAuthenticated = User.isAuthenticated;
    }
}

