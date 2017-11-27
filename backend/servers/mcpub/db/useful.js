const r = require('./../dash');
const parse = require('co-body');
const get_ip = require('ipware')().get_ip;
const model = require('./model/model');

module.exports.updateUseful = function*(next) {
    let params = yield parse(this);
    let results = {};
    if (params.user_id && params.item_id && params.item_type && params.action) {
        if (params.action === 'add') {
            results = yield r.table('useful2item')
                .insert(new model.Useful(params.user_id, params.item_type, params.item_id));
        }
        else if (params.action === 'delete') {
            results = yield r.table('useful2item')
                .getAll([params.user_id, params.item_id],{index: 'user_item'})
                .delete();
        }
    }
    this.status = 200;
    this.body = results;
    yield next;
};