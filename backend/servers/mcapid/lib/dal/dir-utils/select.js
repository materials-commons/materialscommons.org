module.exports = function(r) {
    const db = require('../db')(r);

    async function updateSelectedFiles(selection, selectionId) {
        if (selectionId) {
            await r.table('fileselection').get(selectionId).update(selection);
            return selectionId;
        } else {
            let created = await db.insert('fileselection', selection);
            return created.id;
        }
    }

    return {
        updateSelectedFiles,
    };
};