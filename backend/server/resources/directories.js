module.exports = function(directories) {
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
        if (!dirArgs.from_dir) {
            this.throw(httpStatus.BAD_REQUEST, 'no from_dir specified');
        }

        if (!dirArgs.path) {
            this.throw(httpStatus.BAD_REQUEST, 'no path specified');
        }

        let rv = yield directories.create(this.params.project_id, this.reqctx.project.name, dirArgs);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }

        this.body = {dirs: rv.val};
        yield next;
    }

    function* update(next) {
        let updateArgs = yield parse(this);
        if (!updateArgs.move) {
            this.throw(httpStatus.BAD_REQUEST, 'no move args specified');
        }

        if (!updateArgs.move.new_directory_id) {
            this.throw(httpStatus.BAD_REQUEST, 'no directory id to move to');
        }

        let rv = yield directories.update(this.params.project_id, this.params.directory_id, updateArgs);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        yield next;
    }
};
