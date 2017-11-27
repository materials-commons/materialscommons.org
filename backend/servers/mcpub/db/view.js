const r = require('./../dash');
const parse = require('co-body');
const get_ip = require('ipware')().get_ip;
const model = require('./model/model');

module.exports.addView = function*(next) {
    let params = yield parse(this);
    if (!params.user_id) {
        let ip_info = get_ip(this.request);
        let values = ip_info.clientIp.split(':');
        if (values.length > 3) {
            let ip = values[3];
            params.user_id = ip;
        }
    }
    if (params.user_id) {
        let exists = yield r.table('view2item').getAll([params.user_id, params.item_id],{index: 'user_item'});
        if (exists.length > 0) {
            let count = exists[0].count + 1;
            let updated = yield r.table('view2item').update({count: count});
            this.status = 200;
            this.body = updated;
        } else {
            let inserted = yield r.table('view2item')
                .insert(new model.View(params.user_id, params.item_type, params.item_id));
            this.status = 200;
            this.body = inserted;
        }
    } else {
        this.status = 200;
        this.body = {};
    }
    yield next;
};
