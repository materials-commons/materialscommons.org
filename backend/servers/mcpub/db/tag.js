var r = require('./../dash');
var parse = require('co-body');
var httpStatus = require('http-status');
var defineSchema = require('./../schema/define')();
var tag = require('./model/tag')();
var clone = require('clone');

module.exports.addTag = function*(next) {
    'use strict';
    var params = yield parse(this);
    var copyParams = clone(params);
    var tagSchema = defineSchema.tags;
    var rv;
    var err = yield tagSchema.validateAsync(params);
    if (err) {
        this['throw'](httpStatus.NOT_FOUND, 'Validation error: ' + err);
    }
    var is_tag = yield tag.getTag(params.tag);
    if (!is_tag) {
        prepareTag(params);
        rv = yield tag.insert(params);
    }
    var exists = yield tag.getTag2Dataset(copyParams);
    if (exists.length !== 0) {
        this['throw'](httpStatus.CONFLICT, 'Duplicate request');
    } else {
        rv = yield tag.addTag2Dataset(copyParams);
        this.status = 200;
        this.body = rv;
    }
    yield next;
};

module.exports.removeTag = function*(next) {
    var params = yield parse(this);
    var join = yield tag.getTag2Dataset(params);
    if (join.length > 0) {
        if (params.user_id === join[0].user_id) {
            this.body = yield r.table('tag2dataset').get(join[0].id).delete();
            this.status = 200;
        }
    } else {
        this['throw'](httpStatus.BAD_REQUEST, 'Unable to delete');
    }

    yield next;
};

module.exports.getTagsByCount = function*(next) {
    this.body = yield r.table('tags').merge(function(tag) {
        return {
            count: r.table('tag2dataset').getAll(tag('id'), {index: 'tag'}).count()
        }
    }).orderBy(r.desc('count'));
    yield next;
};

module.exports.getAllTags = function*(next) {
    console.log("server: getAllTags");
    this.body = yield r.table('tags').orderBy('id').merge(function(tag) {
        return {
            count: r.table('tag2dataset').getAll(tag('id'), {index: 'tag'}).count()
        }
    });
    yield next;
};

module.exports.getAllCount = function*(next) {
    this.body = yield r.table('tags').count();
    yield next;
};

module.exports.getDatasetsByTag = function*(next) {
    this.body = yield r.table('tag2dataset').getAll(this.params.id, {index: 'tag'}).merge(function(row) {
        return r.table('datasets').get(row('dataset_id')).merge(function(ds) {
            return {
                'tags': r.table('tag2dataset').getAll(ds('id'), {index: "dataset_id"}).coerceTo('array')
            }
        });
    });
    yield next;
};

function prepareTag(input) {
    return defineSchema.tags.stripNonSchemaAttrs(input);
}
