const r = require('../r');

function* update(table, id) {
    let now = r.now();
    yield r.table(table).get(id).update({mtime: now});
}

module.exports = {
    update
};