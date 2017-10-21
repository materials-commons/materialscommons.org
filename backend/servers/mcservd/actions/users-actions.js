const {Action} = require('actionhero');

module.exports = class ListUsersAction extends Action {
    constructor() {
        super();
        this.name = 'listUsers';
        this.description = 'List users who have marked themselves as available';
    }

    async run({response, params}) {

    }
};

module.exports = class CreateUserAction extends Action {
    constructor() {
        super();
        this.name = 'createUser';
        this.description = 'Create user';
    }

    async run({response, params}) {

    }
};

module.exports = class GetUserAction extends Action {
    constructor() {
        super();
        this.name = 'getUser';
        this.description = 'Get user';
    }

    async run({response, params}) {

    }
};

module.exports = class UpdateUserAction extends Action {
    constructor() {
        super();
        this.name = 'updateUser';
        this.description = 'Update user';
    }

    async run({response, params}) {

    }
};

module.exports = class DeleteUserAction extends Action {
    constructor() {
        super();
        this.name = 'deleteUser';
        this.description = 'Delete user';
    }

    async run({response, params}) {

    }
};

module.exports = class AuthenticateUserAction extends Action {
    constructor() {
        super();
        this.name = 'authenticateUser';
        this.description = 'Authenticate user';
    }

    async run({response, params}) {

    }
};