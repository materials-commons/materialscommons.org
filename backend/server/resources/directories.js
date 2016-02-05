module.exports = function(directories) {
    const parse = require('co-body');
    const httpStatus = require('http-status');

    return {
        get,
        create
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

        this.body = rv.val;
        yield next;
    }
};
