const base = require('./base');
const datasets = require('./datasets');
const notes = require('./notes');
const samples = require('./samples');
const processes = require('./processes');

function createResources(router) {
    base.createResources(router);
    datasets.createResources(router);
    notes.createResources(router);
    samples.createResources(router);
    processes.createResources(router);
}

module.exports = {
    createResources
};
