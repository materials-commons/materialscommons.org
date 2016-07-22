module.exports = function(r) {
    'use strict';

    let _ = require('lodash');

    return {
        insert: insert,
        update: update,
        updateAll: updateAll
    };

    /////////////////

    function *update(table, id, json) {
        let rql = r.table(table).get(id);
        let result = yield rql.update(json, {returnChanges: 'always'}).run();
        return result.changes[0].new_val;
    }

    function *updateAll(rql, json) {
        let items = [];
        if (_.isArray(json) && json.length === 0) {
            return items;
        }
        let results = yield rql.update(json, {returnChanges: 'always'}).run();
        results.changes.forEach(function(item) {
            items.push(item.new_val);
        });
        return items;
    }

    function *insert(table, json, options) {
        let asArray = options ? options.toArray : false;
        if (_.isArray(json) && json.length === 0) {
            return asArray ? [] : {};
        }
        let rql = r.table(table);
        let result = yield rql.insert(json, {returnChanges: 'always'}).run();
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
};
