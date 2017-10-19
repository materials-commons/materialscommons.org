module.exports = function getSingle(r, table, id, index) {
    let run = require('./run');
    if (index) {
        return run(r.table(table).getAll(id, {index: index}))
            .then(function(matches) {
                if (matches.length !== 0) {
                    return matches[0];
                }
                return null;
            });
    }

    return run(r.table(table).get(id)).then(function(item) {
        return item;
    });
};
