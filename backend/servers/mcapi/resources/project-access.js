const access = require('../db/model/access');
let httpStatus = require('http-status');
let projectAccessCache = require('./project-access-cache')(access);

function *validateProject(next) {
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

module.exports.validateProject = validateProject;
