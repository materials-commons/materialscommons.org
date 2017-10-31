const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');

const comments = require("../db/model/comments");

function* getComment() {
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

function* createComment() {
    let user = this.reqctx.user;
    let attrs = yield parse(this);
    let rv = yield comments.createComment(user, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function* updateComment() {
    let attrs = yield parse(this);
    let rv = yield comments.createComment(this.params.comment_id, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        // note - rv already contains rv.val
        this.body = rv;
    }
    yield next;
}

function* deleteComment() {
    let rv = yield comments.createComment(this.params.comment_id, attrs);
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
    router.post('/', createComment);
    router.put('/:comment_id',
        ra.validateCommentExists, ra.validateCommentAccess, updateComment);
    router.delete('/:comment_id',
        ra.validateCommentExists, ra.validateCommentAccess, deleteComment);
    return router;
}


module.exports = {
    createResource
};
