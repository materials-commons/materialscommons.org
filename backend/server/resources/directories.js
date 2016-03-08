module.exports = function(directories, schema) {
    const parse = require('co-body');
    const httpStatus = require('http-status');

    return {
        get,
        create,
        update
    };

    ////////////////
    function* get(next) {
        let dirID = this.params.directory_id || 'top';
        this.body = yield directories.get(this.params.project_id, dirID);
        yield next;
    }

    function* create(next) {
        let dirArgs = yield parse(this);
        dirArgs = prepareDirArgs(this.params.project_id, dirArgs);
        console.log('calling schema.createDirectory.validateAsync');

        let errors = yield validateDirArgs(dirArgs);
        if (errors != null) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield directories.create(this.params.project_id, this.reqctx.project.name, dirArgs);
            if (rv.error) {
                this.status = httpStatus.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = {dirs: rv.val};
            }
        }
        yield next;
    }

    function prepareDirArgs(projectID, dirArgs) {
        schema.createDirectory.stripNonSchemaAttrs(dirArgs);
        dirArgs.project_id = projectID;
        return dirArgs;
    }

    function validateDirArgs(dirArgs) {
        return schema.createDirectory.validateAsync(dirArgs).then(function() {
            console.log('dirArgs validated');
            return null;
        }, function(errors) {
            console.log('dirArgs did not validate', errors);
            return errors;
        });
    }

    function* update(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateArgs(this.params.project_id, this.params.directory_id, updateArgs);
        if (errors !== null) {
            this.body = errors;
            this.status = httpStatus.BAD_REQUEST;
        } else {
            let rv = yield directories.update(this.params.project_id, this.params.directory_id, updateArgs);
            if (rv.error) {
                this.body = rv;
                this.status = httpStatus.NOT_ACCEPTABLE;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* validateUpdateArgs(projectID, directoryID, updateArgs) {
        updateArgs.project_id = projectID;
        if (!updateArgs.move && !updateArgs.rename) {
            return {error: 'badly formed update args'};
        } else if (updateArgs.move) {
            updateArgs.move.project_id = projectID;
            updateArgs.move.directory_id = directoryID;
            schema.moveDirectory.stripNonSchemaAttrs(updateArgs.move);
            return yield validateMoveArgs(updateArgs.move);
        } else {
            updateArgs.rename.project_id = projectID;
            updateArgs.rename.directory_id = directoryID;
            schema.renameDirectory.stripNonSchemaAttrs(updateArgs.rename);
            return yield validateRenameArgs(updateArgs.rename);
        }
    }

    function validateMoveArgs(moveArgs) {
        return schema.moveDirectory.validateAsync(moveArgs).then(function() {
            console.log('moveArgs validated');
            return null;
        }, function(errors) {
            console.log('moveArgs did not validate', errors);
            return errors;
        });
    }

    function validateRenameArgs(renameArgs) {
        return schema.renameDirectory.validateAsync(renameArgs).then(function() {
            console.log('renameArgs validated');
            return null;
        }, function(errors) {
            console.log('renameArgs did not validate', errors);
            return errors;
        });
    }
};
