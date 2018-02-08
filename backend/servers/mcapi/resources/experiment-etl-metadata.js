const metadata = require('../db/model/experiments-etl-metadata');
const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');

function* createEtlExperimentMetadata(next) {
    let user = this.reqctx.user;
    let data = yield parse(this);
    let experiment_id = this.params.experiment_id;
    this.body = yield metadata.create(user.id, experiment_id, data.json)
    yield next;
}

function* getEtlExperimentMetadata(next) {
    this.status = status.METHOD_NOT_ALLOWED;
    yield next;
}

function* updateEtlExperimentMetadata(next) {
    let data = yield parse(this);
    this.status = status.METHOD_NOT_ALLOWED;
    yield next;
}

function* deleteEtlExperimentMetadata(next) {
    this.status = status.METHOD_NOT_ALLOWED;
    yield next;
}

function* getEtlExperimentMetadataByExperiment(next) {
    this.status = status.METHOD_NOT_ALLOWED;
    yield next;
}

function createResource() {
    const router = new Router();

    router.post('/create/:experiment_id', createEtlExperimentMetadata);

    // basic operations
    router.get('/metadata/:id', getEtlExperimentMetadata);
    router.put('/metadata/:id', updateEtlExperimentMetadata);
    router.delete('/metadata/:id', deleteEtlExperimentMetadata);

    // get ETL metadata for experiment
    router.get('experiment/:experiment_id/metadata',getEtlExperimentMetadataByExperiment);

    return router;
}


module.exports = {
    createResource
};
