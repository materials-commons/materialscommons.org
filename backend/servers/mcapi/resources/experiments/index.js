const base = require('./base');
const datasets = require('./datasets');
const notes = require('./notes');
const samples = require('./samples');
const processes = require('./processes');

function createRoutes(router) {
    base.createRoutes(router);
    datasets.createRoutes(router);
    notes.createRoutes(router);
    samples.createRoutes(router);
    processes.createRoutes(router);
}

module.exports = {
    createRoutes
};