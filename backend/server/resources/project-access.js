module.exports = function(access) {
    'use strict';
    let httpStatus = require('http-status');
    let projectAccessCache = require('./project-access-cache')(access);
    return function *validateProject(next) {
        console.log(this.url);
        console.log(this.params);
        let projectID = this.params.project_id;
        let project = yield projectAccessCache.find(projectID);

        if (! project) {
            this.throw(httpStatus.BAD_REQUEST, "Unknown project");
        }

        if (!projectAccessCache.validateAccess(projectID, this.reqctx.user)) {
            this.throw(httpStatus.UNAUTHORIZED, `No access to project ${projectID}`);
        }

        this.reqctx.project = {
            id: projectID,
            name: project.name
        };

        yield next;
    };
};
