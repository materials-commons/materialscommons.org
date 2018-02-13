const metadata = require('../db/model/experiments-etl-metadata');
const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');

function* createEtlExperimentMetadata(next) {
    let user = this.reqctx.user;
    let data = yield parse(this);
    let experiment_id = this.params.experiment_id;
    this.body = yield metadata.create(user.id, experiment_id, data.json);
    yield next;
}

function* getEtlExperimentMetadata(next) {
    let id = this.params.id;
    this.body = yield metadata.get(id);
    yield next;
}

function* updateEtlExperimentMetadata(next) {
    let id = this.params.id;
    let data = yield parse(this);
    this.body = yield metadata.update(id, data.json);
    yield next;
}

function* deleteEtlExperimentMetadata(next) {
    let id = this.params.id;
    results = yield metadata.remove(id);
    this.body = '';
    yield next;
}

function* getEtlExperimentMetadataByExperiment(next) {
    let experiment_id = this.params.experiment_id;
    this.body = yield metadata.getByExperimentId(experiment_id);
    yield next;
}

function createResource() {
    const router = new Router();

    router.put('/create/:experiment_id', createEtlExperimentMetadata);

    // basic operations
    router.get('/metadata/:id', getEtlExperimentMetadata);
    router.post('/metadata/:id', updateEtlExperimentMetadata);
    router.delete('/metadata/:id', deleteEtlExperimentMetadata);

    // get ETL metadata for experiment
    router.get('/experiment/:experiment_id/metadata',getEtlExperimentMetadataByExperiment);

    return router;
}


module.exports = {
    createResource
};
