const access = require('../db/model/access');
const check = require('../db/model/check');
let httpStatus = require('http-status');
let projectAccessCache = require('./project-access-cache')(access);

function* validateProjectAccess(next) {
    let projectID = this.params.project_id;
    if (projectID) {
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
    }

    yield next;
}

function* validateProjectOwner(next) {
    let projectId = this.params.project_id;
    if (projectId) {
        let isOwner = yield check.isUserProjectOwner(this.reqctx.user.id, projectId);
        if (!isOwner) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: 'Only the project owner can delete a project'};
            return this.status;
        }
    }
    yield next;
}

function* validateExperimentOwner(next) {
    let experimentId = this.params.experiment_id;
    if (experimentId) {
        let isOwner = yield check.isUserExperimentOwner(this.reqctx.user.id, experimentId);
        if (!isOwner) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: 'Only the experiment owner can delete an experiment'};
            return this.status;
        }
    }
    yield next;
}

function* validateExperimentInProject(next) {
    let projectId = this.params.project_id;
    let experimentId = this.params.experiment_id;
    let isInProject = yield check.experimentExistsInProject(projectId, experimentId);
    if (!isInProject) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such experiment ${experimentId}`};
        return this.status;
    }
    yield next;
}

function* validateDatasetInExperiment(next) {
    let experimentId = this.params.experiment_id;
    let datasetId = this.params.dataset_id;
    let isInExperiment = yield check.experimentHasDataset(experimentId, datasetId);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such dataset ${datasetId}`};
        return this.status;
    }
    yield next;
}

function* validateDatasetForPublication(next) {
    let datasetId = this.params.dataset_id;
    let hasSamples = yield check.datasetHasSamples(datasetId);
    if (!hasSamples) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `Can not publish dataset, ${datasetId}, no samples`};
        return this.status;
    }
    let hasProcesses = yield check.datasetHasProcesses(datasetId);
    if (!hasProcesses) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `Can not publish dataset, ${datasetId}, no processes`};
        return this.status;
    }
    yield next;
}

function* validateSampleInExperiment(next) {
    let isInExperiment = yield check.sampleInExperiment(this.params.experiment_id, this.params.sample_id);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such sample in experiment ${this.params.sample_id}`};
        return this.status;
    }
    yield next;
}

function* validateProcessInExperiment(next) {
    if (this.params.process_id !== 'templates') {
        let isInExperiment = yield check.processInExperiment(this.params.experiment_id, this.params.process_id);
        if (!isInExperiment) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such process in experiment ${this.params.process_id}`};
            return this.status;
        }
    }
    yield next;
}

function* validateSampleInProject(next) {
    if (this.params.sample_id !== 'measurements') {
        let isInProject = yield check.sampleInProject(this.params.project_id, this.params.sample_id);
        if (!isInProject) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such sample in project ${this.params.sample_id}`};
            return this.status;
        }
    }
    yield next;
}

function* validateDirectoryInProject(next) {
    if (this.params.directory_id !== 'top' && this.params.directory_id !== 'all') {
        let isInProject = yield check.directoryInProject(this.params.project_id, this.params.directory_id);
        if (!isInProject) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such directory in project ${this.params.directory_id}`};
            return this.status;
        }
    }
    yield next;
}

function* validateProcessInProject(next) {
    if (this.params.process_id !== 'templates') {
        let isInProject = yield check.processInProject(this.params.project_id, this.params.process_id);
        if (!isInProject) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such process in project ${this.params.process_id}`};
            return this.status;
        }
    }
    yield next;
}

function* validateFileInProject(next) {
    if (this.params.file_id !== 'by_path') {
        let isInProject = yield check.fileInProject(this.params.file_id, this.params.project_id);
        if (!isInProject) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such file in project ${this.params.file_id}`};
            return this.status;
        }
    }
    yield next;
}

function* validateTaskInExperiment(next) {
    let isInExperiment = yield check.taskInExperiment(this.params.experiment_id, this.params.task_id);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such task in experiment ${this.params.task_id}`};
        return this.status;
    }
    yield next;
}

function* validateTemplateExists(next) {
    let templateExists = yield check.templateExists(this.params.template_id);
    if (!templateExists) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such template ${this.params.template_id}`};
        return this.status;
    }
    yield next;
}

function* validateNoteInExperiment(next) {
    let isInExperiment = yield check.noteInExperiment(this.params.experiment_id, this.params.note_id);
    if (!isInExperiment) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such note in experiment ${this.params.note_id}`};
        return this.status;
    }
    yield next;
}

module.exports = {
    validateProjectAccess,
    validateProjectOwner,
    validateExperimentOwner,
    validateExperimentInProject,
    validateDatasetInExperiment,
    validateDatasetForPublication,
    validateSampleInExperiment,
    validateProcessInExperiment,
    validateSampleInProject,
    validateDirectoryInProject,
    validateProcessInProject,
    validateFileInProject,
    validateTaskInExperiment,
    validateTemplateExists,
    validateNoteInExperiment
};
