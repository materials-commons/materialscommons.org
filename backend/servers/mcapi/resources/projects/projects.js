const projects = require('../../db/model/projects');
const projectDelete = require('../../db/model/project-delete');
const parse = require('co-body');
const status = require('http-status');
const ra = require('../resource-access');
const Router = require('koa-router');

const samples = require('./samples');
const files = require('./files');
const directories = require('./directories');
const processes = require('./processes');
const experiments = require('./experiments');
const activityFeed = require('../../db/model/activity-feed');
const shortcuts = require('./shortcuts');

const schema = require('../../schema');
const experimentDatasets = require('../../db/model/experiment-datasets');
const experimentDatasetsDoi = require('../../db/model/experiment-datasets-doi');
const _ = require('lodash');


function* create(next) {
    let user = this.reqctx.user;
    let attrs = yield parse(this);
    let rv = yield projects.createProject(user, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* all(next) {
    let user = this.reqctx.user;
    if (this.query.simple) {
        this.body = yield projects.forUserSimple(user);
    } else {
        this.body = yield projects.forUser(user);
    }
    yield next;
}

function* getProject(next) {
    let rv = yield projects.getProject(this.params.project_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* deleteProject(next) {
    yield projectDelete.quickProjectDelete(this.params.project_id);
    this.body = {project_id: this.params.project_id};
    yield next;
}

function* deleteProjectFully(next) {
    let options = {
        dryRun: false
    };
    console.log("resource-project-deleteProjectFully", this.params.project_id);
    let rv = yield projectDelete.fullProjectDelete(this.params.project_id, options);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* deleteProjectDryRun(next) {
    let options = {
        dryRun: true
    };
    let rv = yield projectDelete.fullProjectDelete(this.params.project_id, options);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* update(next) {
    let attrs = yield parse(this);
    this.body = yield projects.update(this.params.project_id, attrs);
    yield next;
}

function* getUserAccessForProject(next) {
    this.body = yield projects.getUserAccessForProject(this.params.project_id);
    yield next;
}

function* updateUserAccessForProject(next) {
    let attrs = yield parse(this);
    this.body = yield projects.updateUserAccessForProject(this.params.project_id, attrs);
    yield next;
}

function* getProjectActivityFeed(next) {
    this.body = yield activityFeed.getActivityFeedForProject(this.params.project_id);
    yield next;
}

function * getExcelFilePathsInProject(next) {
    this.body = yield projects.getExcelFilePaths(this.params.project_id);
    yield next;
}

function * updateDatasetForProject (next) {
    let datasetArgs = yield parse(this);
    schema.prepare(schema.updateDatasetSchema, datasetArgs);
    let errors = yield validateUpdateDataset(datasetArgs);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experimentDatasets.updateDataset(this.params.dataset_id, datasetArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function * validateUpdateDataset (datasetArgs) {
    let errors = yield schema.validate(schema.updateDatasetSchema, datasetArgs);
    if (errors !== null) {
        return errors;
    }

    if (datasetArgs.authors && !_.isArray(datasetArgs.authors)) {
        return {error: `authors field must be an array`};
    } else if (datasetArgs.authors) {
        for (let author of datasetArgs.authors) {
            schema.prepare(schema.datasetAuthor, author);
            let e = yield schema.validate(schema.datasetAuthor, author);
            if (e !== null) {
                return e;
            }
        }
    }

    if (datasetArgs.papers && !_.isArray(datasetArgs.papers)) {
        return {error: `papers field must be an array`};
    } else if (datasetArgs.papers) {
        for (let paper of datasetArgs.papers) {
            schema.prepare(schema.datasetPaper, paper);
            let e = yield schema.validate(schema.datasetPaper, paper);
            if (e !== null) {
                return e;
            }
        }
    }

    if (datasetArgs.license && datasetArgs.license.name) {
        let license;
        switch (datasetArgs.license.name) {
            case `Public Domain Dedication and License (PDDL)`:
                license = {
                    name: `Public Domain Dedication and License (PDDL)`,
                    link: `http://opendatacommons.org/licenses/pddl/summary/`
                };
                break;
            case `Attribution License (ODC-By)`:
                license = {
                    name: `Attribution License (ODC-By)`,
                    link: `http://opendatacommons.org/licenses/by/summary/`
                };
                break;
            case `Open Database License (ODC-ODbL)`:
                license = {
                    name: `Open Database License (ODC-ODbL)`,
                    link: `http://opendatacommons.org/licenses/odbl/summary/`
                };
                break;
            default:
                if (datasetArgs.license.name === '') {
                    license = {
                        name: '',
                        link: ''
                    };
                } else {
                    return {error: `Unknown license ${datasetArgs.license.name}`};
                }
        }
        datasetArgs.license = license;
    }

    if (datasetArgs.keywords) {
        for (let i = 0; i < datasetArgs.keywords.length; i++) {
            if (!_.isString(datasetArgs.keywords[i])) {
                return {error: `Keywords must be strings`};
            }
        }
    }

    return null;
}

function * createAndAddNewDoi (next) {
    let processArgs = yield parse(this);
    let ok = yield experimentDatasetsDoi.doiServerStatusIsOK();
    if (!ok) {
        this.status = status.SERVICE_UNAVAILABLE;
        this.body = 'DOI Service is Unavaiable';
    } else {
        let error = validateDoiMintingArgs(processArgs);
        if (error) {
            this.status = status.UNAUTHORIZED;
            this.body = error;
        }
        else {
            let otherArgs = {};
            if (processArgs.description) {
                otherArgs.description = processArgs.description;
            }
            this.body = yield experimentDatasetsDoi.doiMint(this.params.dataset_id,
                processArgs.title, processArgs.author, processArgs.publication_year, otherArgs).val;
        }
    }

    yield next;
}

function validateDoiMintingArgs (processArgs) {
    if (!processArgs.title) {
        return {error: 'Bad arguments - title is a required field'};
    }
    if (!processArgs.author) {
        return {error: 'Bad arguments - author is a required field'};
    }
    if (!processArgs.publication_year) {
        return {error: 'Bad arguments - publication_year is a required field'};
    }
    return null;
}

function * checkDataset (next) {
    let rv = yield experimentDatasets.canPublishDataset(this.params.dataset_id);
    if (rv.error) {
        this.status = status.UNAUTHORIZED;
    } else {
        this.body = rv.val;
    }

    yield next;
}

function createResource() {
    const router = new Router();
    router.get('/', all);
    router.post('/', create);
    router.use('/:project_id', ra.validateProjectAccess);
    router.put('/:project_id', update);
    router.get('/:project_id', getProject);
    router.delete('/:project_id', ra.validateProjectOwner, deleteProject);
    router.delete('/:project_id/fully',ra.validateProjectOwner, deleteProjectFully);
    router.get('/:project_id/dryrun', ra.validateProjectOwner, deleteProjectDryRun);

    router.put('/:project_id/datasets/:dataset_id', ra.validateDatasetInProject, updateDatasetForProject);
    router.post('/:project_id/datasets/:dataset_id/doi', ra.validateDatasetInProject, createAndAddNewDoi);
    router.get('/:project_id/datasets/:dataset_id/check', ra.validateDatasetInProject, checkDataset);

    router.get('/:project_id/access', ra.validateProjectOwner, getUserAccessForProject);
    router.put('/:project_id/access', ra.validateProjectOwner, updateUserAccessForProject);

    router.get('/:project_id/activity_feed', getProjectActivityFeed);
    router.get('/:project_id/excel_files', getExcelFilePathsInProject);

    let samplesResource = samples.createResource();
    router.use('/:project_id/samples', samplesResource.routes(), samplesResource.allowedMethods());

    let filesResource = files.createResource();
    router.use('/:project_id/files', filesResource.routes(), filesResource.allowedMethods());

    let directoriesResource = directories.createResource();
    router.use('/:project_id/directories', directoriesResource.routes(), directoriesResource.allowedMethods());

    let processesResource = processes.createResource();
    router.use('/:project_id/processes', processesResource.routes(), processesResource.allowedMethods());

    let experimentsResource = experiments.createResource();
    router.use('/:project_id/experiments', experimentsResource.routes(), experimentsResource.allowedMethods());

    let shortcutsResource = shortcuts.createResource();
    router.use('/:project_id/shortcuts', shortcutsResource.routes(), shortcutsResource.allowedMethods());

    return router;
}

module.exports = {
    createResource
};
