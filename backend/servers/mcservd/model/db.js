const r = require('actionhero').api.r;
const _ = require('lodash');

async function update(table, id, json) {
    let rql = r.table(table).get(id);
    let result = await rql.update(json, {returnChanges: 'always'}).run();
    return result.changes[0].new_val;
}

async function updateAll(rql, json) {
    let items = [];
    if (_.isArray(json) && json.length === 0) {
        return items;
    }
    let results = await rql.update(json, {returnChanges: 'always'}).run();
    results.changes.forEach(function(item) {
        items.push(item.new_val);
    });
    return items;
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
        let results = [];
        result.changes.forEach(function(result) {
            results.push(result.new_val);
        });
        return results;
    }
}

module.exports = {
    insert: insert,
    update: update,
    updateAll: updateAll
};
