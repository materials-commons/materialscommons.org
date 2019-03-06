const {Action, api} = require('actionhero');
const dal = require('@dal');
const {failAuth} = require('@lib/connection-helpers');
const validator = require('validator');
const _ = require('lodash');

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
        let apikey = await dal.tryCatch(async() => await api.mc.users.resetApikey(user.id));
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

module.exports.CreateNewUserAction = class CreateNewUserAction extends Action {
    constructor() {
        super();
        this.name = 'createNewUser';
        this.description = 'Creates a new user';
        this.do_not_authenticate = true;
        this.inputs = {
            email: {
                required: true,
                validator: param => {
                    if (!validator.isEmail(param)) {
                        throw new Error(`Field email must be a valid email: ${param}`);
                    }
                }
            },

            fullname: {
                required: true,
            },

            password: {
                required: true,
                validator: param => {
                    if (!_.isString(param)) {
                        throw new Error(`password must be a string`);
                    }

                    if (param.length < 6) {
                        throw new Error(`password must be at least 6 characters long`);
                    }
                }
            },
        };
    }

    async run({response, params}) {
        let user = await dal.tryCatch(async() => await api.mc.users.createNewUser(params.email, params.fullname, params.password));
        if (!user) {
            throw new Error(`Unable to create create '${params.fullname}' with email ${params.email}`);
        }

        response.data = user;
    }
};