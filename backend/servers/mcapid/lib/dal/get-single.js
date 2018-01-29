let run = require('./run');

module.exports = async function getSingle(r, table, id, index) {
    if (index) {
        const matches = await r.table(table).getAll(id, {index: index});
        if (matches.length !== 0) {
            return matches[0];
        }
        return null;
    }
    return await run(r.table(table).get(id));
};
