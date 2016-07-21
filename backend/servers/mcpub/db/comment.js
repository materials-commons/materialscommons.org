var r = require('./../dash');
var parse = require('co-body');
var defineSchema = require('./../schema/define')();
var httpStatus = require('http-status');
var comment = require('./model/comment')();

module.exports.addComment = function*(next) {
    var params = yield parse(this);
    var commentSchema = defineSchema.comments;
    var err = yield commentSchema.validateAsync(params);
    if (err) {
        this['throw'](httpStatus.BAD_GATEWAY, 'Validation error');
    }
    params.birthtime = r.now();
    var rv = yield comment.insert(params);
    if (rv.error) {
        this.status = httpStatus.INTERNAL_SERVER_ERROR;
        this.body = rv.error;
    } else {
        this.status = 200;
        this.body = rv;
    }
    yield next;
};


