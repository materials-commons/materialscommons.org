const access = require('../db/model/access');
const experiments = require('../db/model/experiments');
const samples = require('../db/model/samples');
let httpStatus = require('http-status');
let projectAccessCache = require('./project-access-cache')(access);


function* validateProjectAccess(next) {
    let projectID = this.params.project_id;
    let projects = yield projectAccessCache.find(projectID);

    if (!projects) {
        this.throw(httpStatus.BAD_REQUEST, "Unknown project");
    }

    if (!projectAccessCache.validateAccess(projectID, this.reqctx.user)) {
        this.throw(httpStatus.UNAUTHORIZED, `No access to project ${projectID}`);
    }

    this.reqctx.project = {
        id: projectID,
        name: projects[0].project_name
    };

    yield next;
}

function* validateExperimentInProject(next) {
    let projectId = this.params.project_id;
    let experimentId = this.params.experiment_id;
    let isInProject = yield experiments.experimentExistsInProject(projectId, experimentId);
    if (!isInProject) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such experiment ${experimentId}`};
    }
    yield next;
}

function* validateDatasetInExperiment(next) {
    let experimentId = this.params.experiment_id;
    let datasetId = this.params.dataset_id;
    let isInExperiment = yield experiments.experimentHasDataset(experimentId, datasetId);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such dataset ${datasetId}`};
    }
    yield next;
}

function* validateSampleInExperiment(next) {
    let isInExperiment = yield experiments.sampleInExperiment(this.params.experiment_id, this.params.sample_id);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such sample in experiment ${this.params.sample_id}`};
    }
    yield next;
}

function* validateProcessInExperiment(next) {
    let isInExperiment = yield experiments.processInExperiment(this.params.experiment_id, this.params.process_id);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such process in experiment ${this.params.process_id}`};
    }
    yield next;
}

function* validateSampleInProject(next) {
    let isInProject = yield samples.sampleInProject(this.params.project_id, this.params.sample_id);
    if (!isInProject) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such sample in project ${this.params.sample_id}`};
    }
    yield next;
}

module.exports = {
    validateProjectAccess,
    validateExperimentInProject,
    validateDatasetInExperiment,
    validateSampleInExperiment,
    validateProcessInExperiment,
    validateSampleInProject
};
