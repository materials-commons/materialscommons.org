module.exports = function(projectAccessCache) {
    'use strict';
    let httpStatus = require('http-status');
    return function *validateProject(next) {
        let projectID = this.params.project_id;
        let project = yield projectAccessCache.find(projectID);
        if (! project) {
            this.throw(httpStatus.BAD_REQUEST, "Unknown project");
        }

        if (!projectAccessCache.validateAccess(projectID, this.reqctx.user)) {
            this.throw(httpStatus.UNAUTHORIZED, `No access to project ${project_id}`);
        }

        this.reqctx.project = {
            id: projectID,
            name: project.name
        };

        yield next;
    };
};
