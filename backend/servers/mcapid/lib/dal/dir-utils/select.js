module.exports = function(r) {
    const db = require('../db')(r);

    async function updateSelectedFiles(selection, selectionId) {
        if (selectionId) {
            r.table('fileselection').get(selectionId).update(selection);
            return selectionId;
        } else {
            let created = db.insert(selection);
            return created.id;
        }
    }

    return {
        updateSelectedFiles,
    };
};