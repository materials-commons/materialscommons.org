const {Action} = require('actionhero');
const datasets = require('../model/datasets');

module.exports = class AllPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'allPublishedDatasets';
        this.description = 'Returns all datasets that have been published';
    }

    async run({response}) {
        response.users = await datasets.getAll();
    }
};