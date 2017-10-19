const r = require('actionhero').api.r;

async function renameDirectory(directoryID, newName) {
    let baseDirectory = await r.table('datadirs').get(directoryID);
    let currentPath = baseDirectory.name;
    let parts = currentPath.split('/');
    parts[parts.length - 1] = newName;
    let newPath = parts.join('/');

    let directoryIdSet = new Set([directoryID]);
    let size = directoryIdSet.size;
    let oldSize = 0;
    while (size !== oldSize) {
        oldSize = size;
        let directoryList = await r.table('datadirs').getAll(r.args([...directoryIdSet]), {index: 'parent'});
        for (let i = 0; i < directoryList.length; i++) {
            directoryIdSet.add(directoryList[i].id);
        }
        size = directoryIdSet.size;
    }

    let directoryList = await r.table('datadirs').getAll(r.args([...directoryIdSet]));
    for (let i = 0; i < directoryList.length; i++) {
        let directory = directoryList[i];
        directory.name = directory.name.replace(currentPath, newPath);
    }

    await r.table('datadirs').insert(directoryList, {conflict: 'update'});
}

module.exports = {
    renameDirectory
};
