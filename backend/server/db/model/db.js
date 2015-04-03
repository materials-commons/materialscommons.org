module.exports = function(r) {

    return {
        insert: insert,
        update: update,
        updateAll: updateAll
    };

    /////////////////

    function *update(table, id, json) {
        let rql = r.table(table).get(id);
        let result = yield rql.update(json, {returnChanges: true}).run();
        return result.changes[0].new_val;
    }

    function *updateAll(rql, json) {
        let items = [];
        let results = yield rql.update(json, {returnChanges: true}).run();
        results.changes.forEach(function(item) {
            items.push(item.new_val);
        });
        return items;
    }

    function *insert(table, json) {
        let rql = r.table(table);
        let result = yield rql.insert(json, {returnChanges: true}).run();
        return result.changes[0].new_val;
    }


    ////////////////// private //////////////////
};
