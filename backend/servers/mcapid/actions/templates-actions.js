const {Action, api} = require('actionhero');
const templates = require('../lib/dal/templates');


module.exports.allTemplatesPublic = class TopViewedPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'allTemplatesPublic';
        this.description = 'Returns all public templages';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        api.log("Call to get all templates",'info');
        response.data = await templates.getAllTemplates();
        api.log("Results of get all templates",'info',response.data.length);
    }
};