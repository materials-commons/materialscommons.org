const access = require('../db/model/access');
const check = require('../db/model/check');
const httpStatus = require('http-status');
const projectAccessCache = require('./project-access-cache')(access);
const files = require('../db/model/files');


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

function* checkProjectAccess(projectId, user) {
    let projects = yield projectAccessCache.find(projectId);
    if (!projects) {
        this.throw(httpStatus.BAD_REQUEST, "Unknown project");
    }

    if (!projectAccessCache.validateAccess(projectId, user)) {
        this.throw(httpStatus.UNAUTHORIZED, `No access to project ${projectID}`);
    }
}

function* validateProjectOwner(next) {
    let projectId = this.params.project_id;
    console.log("validateProjectOwner", projectId);
    if (projectId) {
        let isOwner = yield check.isUserProjectOwner(this.reqctx.user.id, projectId);
        console.log("validateProjectOwner", this.reqctx.user.id, isOwner);
        if (!isOwner) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: 'Only the project owner can delete a project'};
            return this.status;
        }
    }
    yield next;
}

function* validateExperimentOwner(next) {
    let experimentId = this.params.experiment_id,
        projectId = this.params.project_id;
    if (experimentId && projectId) {
        let isOwner = yield check.isUserExperimentOwner(this.reqctx.user.id, experimentId, projectId);
        if (!isOwner) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: 'Only the experiment owner can delete an experiment'};
            return this.status;
        }
    }

    yield next;
}

function* validateExperimentId(next) {
    let experimentId = this.params.experiment_id;
    check.experimentExists
}

function* validateExperimentInProject(next) {
    if (this.params.experiment_id !== 'merge' && this.params.experiment_id !== 'delete') {
        let projectId = this.params.project_id;
        let experimentId = this.params.experiment_id;
        let isInProject = yield check.experimentExistsInProject(projectId, experimentId);
        if (!isInProject) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = {error: `No such experiment ${experimentId}`};
            return this.status;
        }
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

function * validateDatasetInProject (next) {
    let projectId = this.params.project_id;
    let datasetId = this.params.dataset_id;
    let isInProject = yield check.projectHasDataset(projectId, datasetId);
    if (!isInProject) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such dataset ${datasetId}`};
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

function* validateTemplateAccess(next) {
    let isOwner = yield check.templateIsOwnedBy(this.params.template_id, this.reqctx.user.id);
    if (!isOwner) {
        let isAdmin = yield check.isTemplateAdmin(this.reqctx.user.id);
        if (!isAdmin) {
            this.status = httpStatus.UNAUTHORIZED;
            this.body = {error: `user does not have access to this template, ${this.params.template_id}`};
            return this.status
        }
    }
    yield next;
}

function* validateCommentExists(next) {
    let commentExists = yield check.commentExists(this.params.comment_id);
    if (!commentExists) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such comment ${this.params.comment_id}`};
        return this.status;
    }
    yield next;
}

function* validateCommentAccess(next) {
    let isOwner = yield check.commentIsOwnedBy(this.params.comment_id, this.reqctx.user.id);
    if (!isOwner) {
        this.status = httpStatus.UNAUTHORIZED;
        this.body = {error: `user does not have access to this comment, ${this.params.comment_id}`};
        return this.status
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

function* validateFileAccess(next) {
    let file = yield files.getFileSimple(this.params.file_id);
    if (!file) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such file ${this.params.file_id}`};
        return this.status;
    }

    let accessAllowed = yield fileAccessAllowed(this.params.file_id, this.reqctx.user.id);
    if (!accessAllowed) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `No such file ${this.params.file_id}`};
        return this.status;
    }

    this.reqctx.file = file;
    yield next;
}

function* fileAccessAllowed(fileId, userId) {
    if (yield isInPublishedDataset(fileId)) {
        return true;
    }

    let projects = yield files.getFileProjects(fileId);
    for (let i = 0; i < projects.length; i++) {
        let accessEntries = yield access.projectAccessList(projects[i].id);
        for (let j = 0; j < accessEntries.length; j++) {
            if (accessEntries[j].user_id === userId) {
                return true;
            }
        }
    }

    return false;
}

function* isInPublishedDataset(fileId) {
    let datasets = yield files.getFileDatasets(fileId);
    for (let i = 0; i < datasets.length; i++) {
        if (datasets[i].published) {
            return true;
        }
    }

    return false;
}

module.exports = {
    validateProjectAccess,
    validateProjectOwner,
    validateExperimentOwner,
    validateExperimentInProject,
    validateDatasetInExperiment,
    validateDatasetInProject,
    validateSampleInExperiment,
    validateProcessInExperiment,
    validateSampleInProject,
    validateDirectoryInProject,
    validateProcessInProject,
    validateFileInProject,
    validateTaskInExperiment,
    validateTemplateAccess,
    validateTemplateExists,
    validateCommentAccess,
    validateCommentExists,
    validateNoteInExperiment,
    validateFileAccess,
    checkProjectAccess,
};
