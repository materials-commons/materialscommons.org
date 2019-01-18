const r = require('../../../shared/r');
const _ = require('lodash');

async function update(table, id, json) {
    let rql = r.table(table).get(id);
    let result = await rql.update(json, {returnChanges: 'always'});
    return result.changes[0].new_val;
}

async function updateAll(rql, json) {
    let items = [];
    if (_.isArray(json) && json.length === 0) {
        return items;
    }
    let results = await rql.update(json, {returnChanges: 'always'});
    return results.changes.map(item => item.new_val);
}

async function insert(table, json, options) {
    let asArray = options ? options.toArray : false;
    if (_.isArray(json) && json.length === 0) {
        return asArray ? [] : {};
    }
    let rql = r.table(table);
    let result = await rql.insert(json, {returnChanges: 'always'}).run();
    if (result.changes.length == 1) {
        let val = result.changes[0].new_val;
        return asArray ? [val] : val;
    } else {
        return result.changes.map(result => result.new_val);
    }
}

module.exports = {
    insert: insert,
    update: update,
    updateAll: updateAll
};
