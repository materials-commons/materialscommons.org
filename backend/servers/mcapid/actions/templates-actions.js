const {Action, api} = require('actionhero');

module.exports.GetAllPublicTemplatesAction = class GetAllPublicTemplatesAction extends Action {
    constructor() {
        super();
        this.name = 'getAllPublicTemplates';
        this.description = 'Returns all public templates';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        response.data = await api.mc.templates.getAllTemplates();
    }
};