const {Action, api} = require('actionhero');
const dal = require('@dal');

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