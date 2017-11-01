const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');

const comments = require("../db/model/comments");

function* getComment(next) {
    let rv = yield comments.getComment(this.params.comment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function* addComment(next) {
    let user = this.reqctx.user;
    let attrs = yield parse(this);
    let rv = yield comments.addComment(user.id, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function* updateComment(next) {
    let attrs = yield parse(this);
    let rv = yield comments.updateComment(this.params.comment_id, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function* deleteComment(next) {
    let rv = yield comments.deleteComment(this.params.comment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function createResource() {
    const router = new Router();

    router.get('/:comment_id',
        ra.validateCommentExists, ra.validateCommentAccess, getComment);
    router.post('/', addComment);
    router.put('/:comment_id',
        ra.validateCommentExists, ra.validateCommentAccess, updateComment);
    router.delete('/:comment_id',
        ra.validateCommentExists, ra.validateCommentAccess, deleteComment);
    return router;
}


module.exports = {
    createResource
};
