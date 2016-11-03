const base = require('./base');
const datasets = require('./datasets');
const notes = require('./notes');
const samples = require('./samples');
const processes = require('./processes');
const tasks = require('./tasks');

function createResources(router) {
    base.createResources(router);
    datasets.createResources(router);
    notes.createResources(router);
    samples.createResources(router);
    processes.createResources(router);
    tasks.createResources(router);
}

module.exports = {
    createResources
};
