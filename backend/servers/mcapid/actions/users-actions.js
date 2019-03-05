const {Action, api} = require('actionhero');
const dal = require('@dal');
const {failAuth} = require('@lib/connection-helpers');

module.exports.GetAllUsersAction = class GetAllUsersAction extends Action {
    constructor() {
        super();
        this.name = 'getAllUsers';
        this.description = 'Returns a list of user email addresses and names';
    }

    async run({response}) {
        let users = await dal.tryCatch(async() => await api.mc.users.getUsersSummary());
        if (users === null) {
            throw new Error(`Unable to retrieve list of users`);
        }

        response.data = users;
    }
};

module.exports.ResetUserApikeyAction = class ResetUserApikeyAction extends Action {
    constructor() {
        super();
        this.name = 'resetUserApikey';
        this.description = 'Resets the current users apikey and returns the new apikey';
    }

    async run({response, user}) {
        let apikey = await dal.tryCatch(async() => await api.mc.user.resetApikey(user.id));
        if (!apikey) {
            throw new Error(`Unable to reset apikey`);
        }

        response.data = apikey;
    }
};

module.exports.LoginAction = class LoginAction extends Action {
    constructor() {
        super();
        this.name = 'login';
        this.description = 'Returns the user record with a token to use in api calls';
        this.do_not_authenticate = true;
        this.inputs = {
            user_id: {
                required: true,
            },
            password: {
                required: true,
            }
        };
    }

    async run({response, params, connection}) {
        let u = await dal.tryCatch(async() => await api.mc.users.loginUserReturningToken(params.user_id, params.password));
        if (!u) {
            failAuth(connection);
        }

        response.data = u;
    }
};