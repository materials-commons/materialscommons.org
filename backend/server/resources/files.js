module.exports = function(files) {
    const parse = require('co-body');
    const httpStatus = require('http-status');

    return {
        get: get,
        getList: getList,
        update: update,
        deleteFile
    };

    ///////////////////

    // get retrieves a file.
    function* get(next) {
        this.body = yield files.get(this.params.file_id);
        yield next;
    }

    function* getList(next) {
        let args = yield parse(this);
        this.body = yield files.getList(this.params.project_id, args.file_ids);
        yield next;
    }

    // put will update certain file fields. To see which fields can be updated look
    // at the files.put method.
    function* update(next) {
        let file = yield parse(this);
        let rv = yield files.update(this.params.file_id, this.params.project_id, this.reqctx.user.id, file);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        yield next;
    }

    // deleteFile will attempt to delete the named file.
    function* deleteFile(next) {
        console.log('deleteFile in resources called');
        let rv = yield files.deleteFile(this.params.file_id);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        yield next;
    }
};
