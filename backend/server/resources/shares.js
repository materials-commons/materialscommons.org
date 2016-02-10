module.exports = function(shares, schema) {
    const httpStatus = require('http-status');
    const parse = require('co-body');

    return {
        getList: getList,
        create: create,
        remove: remove
    };

    function* getList(next) {
        const user = this.reqctx.user.id;
        const projectID = this.params.project_id;
        let rv = yield shares.getList(projectID, user);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.status = 200;
        this.body = rv.val;
        yield next;
    }

    function* create(next) {
        const projectID = this.params.project_id;
        let shareItem = yield parse(this);
        let rv = yield shares.create(projectID, shareItem);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }

        this.status = httpStatus.CREATED;
        this.body = rv.val;
        yield next;
    }

    function* remove(next) {
        const shareID = this.param.share_id;
        let args = yield parse(this);
        let rv = yield shares.remove(args.user, shareID);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.status = httpStatus.OK;
        yield next;
    }
};
