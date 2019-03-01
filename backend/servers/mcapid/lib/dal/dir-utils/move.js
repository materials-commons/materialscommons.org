const path = require('path');
module.exports = function(r) {

    async function moveDir(directoryId, toDirectoryId) {
        let dirs = await r.table('datadirs').getAll(directoryId, toDirectoryId);
        let origDir = dirs.filter(d => d.id === directoryId)[0];
        let toDir = dirs.filter(d => d.id === toDirectoryId)[0];
        let origDirName = path.basename(origDir.name);
        let newPathName = path.join(toDir.name, origDirName);
        await moveDirAndDescendents(directoryId, origDir.name, newPathName);
        await r.table('datadirs').get(directoryId).update({parent: toDir.id});
    }

    // renameChildDirs renames all the children of directoryId by replacing
    // the old name with the new name. The reason this is done is because
    // directory names contain the full path.
    //
    // Example:
    //    Given project/dir1/dir2/dir3
    //    There are 4 directories named:
    //       project
    //       project/dir1
    //       project/dir1/dir2
    //       project/dir1/dir2/dir3
    //    If dir1 renamed to newdir1, then the names for the directories
    //    would need to be:
    //       project
    //       project/newdir1
    //       project/newdir1/dir2
    //       project/newdir1/dir2/dir3
    //
    // This method will find all the descendents or dir1 and update their
    // names to reflect the new structure above.
    async function moveDirAndDescendents(directoryId, oldPath, newPath) {
        // For this part we want to do the updates as efficiently as
        // possible by doing them in one go, rather than making multiple
        // calls to the database. To do this we are going to gather all
        // the entries into a set, changes their names then do a single
        // write back to the database.
        // Since we need to get all descendents we have to continue to
        // run queries as we go through all the dirs.
        let directoryIdSet = new Set([directoryId]); // initialize with first dir
        let size = directoryIdSet.size;
        let oldSize = 0;
        // Loop until our queries don't change the set.
        while (size !== oldSize) {
            oldSize = size;
            // Take all the ids from the directoryIdSet and find the directories that have them
            // as a parent. We are redundantly querying from the set which means we are querying on
            // dirs we queried before plus new ones. This is inefficient but in practice hasn't affected
            // the application.
            let directoryList = await r.table('datadirs').getAll(r.args([...directoryIdSet]), {index: 'parent'});
            // Add directories from query into set
            for (let i = 0; i < directoryList.length; i++) {
                directoryIdSet.add(directoryList[i].id);
            }

            // Set size to new size. Thus if the nothing new was added, then the loop
            // will exit because size === oldSize.
            size = directoryIdSet.size;
        }

        // This point we have all the directory ids in directoryIdSet that we want to change,
        // so make a query to get them all and then rename their paths.
        let directoryList = await r.table('datadirs').getAll(r.args([...directoryIdSet]));

        // Rename the directories to the new path
        for (let i = 0; i < directoryList.length; i++) {
            let directory = directoryList[i];
            directory.name = directory.name.replace(oldPath, newPath);
        }

        // Update database in a single call
        await r.table('datadirs').insert(directoryList, {conflict: 'update'});
    }

    async function renameDir(directoryId, newDirectoryName) {
        let dir = await r.table('datadirs').get(directoryId);
        let oldName = dir.name;

        // replace the last entry in the name with newDirectoryName
        // ie, given name a/b/c then c is what we are renaming.
        // So, if we split on '/', then the last entry will b 'c',
        // and we can replace c with the new name.
        // Example:
        //    (assume newName = 'd')
        //    let parts = "a/b/c".split('/') // => ['a', 'b', 'c']
        //    So to replace 'c' with new name
        //    parts[parts.length-1] = newName;
        //    so parts is now => ['a', 'b', 'd']
        //
        let dirParts = oldName.split('/');
        dirParts[dirParts.length - 1] = newDirectoryName;

        // Following our example above, we join on parts to
        // get the new path, ie
        // parts.join('/') => 'a/b/d', which is the new name for
        // the directory.
        let fixedNamePath = dirParts.join('/');
        await moveDirAndDescendents(directoryId, oldName, fixedNamePath);
    }

    return {
        moveDir,
        renameDir,
    };
};