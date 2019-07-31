const mcdir = require('@lib/mcdir');

module.exports = function(r) {
    async function deleteDirsAndFilesInDirectoryFromProject(filesAndDirs, directoryId, projectId) {
        let files = filesAndDirs.filter(e => e.otype === 'file'),
            dirs = filesAndDirs.filter(e => e.otype === 'directory'),
            filesDeletedResults,
            dirsDeletedResults;

        let allFilesInDir = await checkAllFilesInDir(files, directoryId);
        if (!allFilesInDir) {
            filesDeletedResults = [{error: `Not all files in directory ${directoryId}`}];
        } else {
            filesDeletedResults = await deleteFilesFromDirectory(files, directoryId);
        }

        let allDirsInDir = await checkAllDirsInDir(dirs, directoryId);
        if (!allDirsInDir) {
            dirsDeletedResults = [{error: `Not all directories in directory ${directoryId}`}];
        } else {
            dirsDeletedResults = await deleteDirsFromProject(dirs, directoryId, projectId);
        }

        return {
            files: filesDeletedResults,
            directories: dirsDeletedResults,
        };
    }

    async function checkAllFilesInDir(files, directoryId) {
        let indexArgs = files.map(f => [directoryId, f.id]);
        let count = await r.table('datadir2datafile').getAll(r.args(indexArgs), {index: 'datadir_datafile'}).count();
        return count === files.length;
    }

    async function checkAllDirsInDir(dirs, directoryId) {
        let indexArgs = dirs.map(d => [d.id, directoryId]);
        let count = await r.table('datadirs').getAll(r.args(indexArgs), {index: 'datadir_parent'}).count();
        return count === dirs.length;
    }

    async function deleteFilesFromDirectory(files, directoryId) {
        let fileResults = [];
        for (let file of files) {
            fileResults.push(await deleteFileInDirectory(file.id, directoryId, false));
        }

        return fileResults;
    }

    // deleteFileInDirectoryFromProject will delete the file and all the associations. The allowIfUsed
    // flag will allow the file to be deleted if it is used in any samples or processes.
    async function deleteFileInDirectory(fileId, directoryId, allowIfUsed) {
        let file = await getFileInDirHandlingErrors(fileId, directoryId);
        if (file === null) {
            return {error: `File ${fileId} not in directory ${directoryId}`};
        }

        if (!allowIfUsed) {
            let referenceMsg = await checkFileNotUsed(fileId);
            if (referenceMsg !== null) {
                return referenceMsg;
            }
        }

        await deleteFileAssociations(fileId);

        await r.table('datafiles').get(fileId).delete();

        if (file.current && file.parent !== '') {
            // We are deleting the current or leaf version. So set its parent
            // to be the current file so that the file doesn't disappear from
            // the directory structure.
            await r.table('datafiles').get(file.parent).update({current: true});
        }

        // Lastly, delete the physical file only if nothing points at it
        await deleteOnDiskFileIfNoReferences(file);

        return {success: `Successfully deleted file ${fileId}`};
    }

    // checkFileNotUsed checks if the file is referenced by any processes, samples or datasets
    // and returns an error msg if it is.
    async function checkFileNotUsed(fileId) {
        // Files that are used in samples, processes, or datasets won't be deleted
        // unless this flag is set to true. Check to make sure the file isn't referenced
        // by any of these objects.
        let processes = await r.table('process2file').getAll(fileId, {index: 'datafile_id'});
        if (processes.length) {
            // File is used in processes and we aren't allowing it to be deleted.
            return {error: `File ${fileId} is used in processes ${processes.map(p => p.process_id)}`};
        }

        let samples = await r.table('sample2datafile').getAll(fileId, {index: 'datafile_id'});
        if (samples.length) {
            return {error: `File ${fileId} is used in samples ${samples.map(s => s.sample_id)}`};
        }

        let datasets = await r.table('dataset2datafile').getAll(fileId, {index: 'datafile_id'});
        if (datasets.length) {
            return {error: `File ${fileId} is used in datasets ${datasets.map(s => s.dataset_id)}`};
        }

        return null;
    }

    // getFileInDirHandlingErrors will attempt to the get file. If there are any errors it will
    // return null.
    async function getFileInDirHandlingErrors(fileId, directoryId) {
        let file;
        try {
            file = await r.table('datadir2datafile').getAll([directoryId, fileId], {index: 'datadir_datafile'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().nth(0);
        } catch (e) {
            file = null;
        }

        return file;
    }

    async function deleteFileAssociations(fileId) {
        // delete associations
        await deleteFileFromJoinTable(fileId, 'datadir2datafile');
        await deleteFileFromJoinTable(fileId, 'dataset2datafile');
        await deleteFileFromJoinTable(fileId, 'experiment2datafile');
        await deleteFileFromJoinTable(fileId, 'measurement2datafile');
        await deleteFileFromJoinTable(fileId, 'project2datafile');
        await deleteFileFromJoinTable(fileId, 'sample2datafile');
        await deleteFileFromJoinTable(fileId, 'process2file');
    }

    async function deleteFileFromJoinTable(fileId, tableName) {
        await r.table(tableName).getAll(fileId, {index: 'datafile_id'}).delete();
    }

    async function deleteOnDiskFileIfNoReferences(file) {
        let count = await r.table('datafiles').getAll(file.checksum, {index: 'checksum'}).count();
        if (count !== 0) {
            // There are other files with matching checksums so the file cannot be deleted. The
            // reason for this is we only ever store one physical file with a matching checksum.
            // If there are other files with this checksum then they will ultimately point
            // at that one physical file.
            return;
        }

        // If usesid is set that means this file points at another file that is the original
        // and single file with this checksum. Files are stored by their id. So, the original
        // file entry in the database may be gone, but the physical file on disk will have
        // as its name its id.
        let idToUse = file.usesid !== '' ? file.usesid : file.id;
        mcdir.deleteFile(idToUse);
    }

    async function deleteDirsFromProject(dirs, parentId, projectId) {
        let dirResults = [];
        for (let dir of dirs) {
            dirResults.push(await deleteDirInDirectoryFromProject(dir.id, parentId, projectId));
        }

        return dirResults;
    }

    async function deleteDirInDirectoryFromProject(dirId, parentId, projectId) {
        if (!await dirIsEmpty(dirId)) {
            return {error: `Directory ${dirId} is not empty`};
        }

        await r.table('datadirs').get(dirId).delete();
        await r.table('project2datadir').getAll([projectId, dirId], {index: 'project_datadir'}).delete();

        return {success: `Directory ${dirId} was deleted`};
    }

    async function dirIsEmpty(dirId) {
        let dirsCount = await r.table('datadirs').getAll(dirId, {index: 'parent'}).count();
        if (dirsCount !== 0) {
            return false;
        }

        let fileCount = await r.table('datadir2datafile').getAll(dirId, {index: 'datadir_id'})
            .eqJoin('datafile_id', r.table('datafiles')).filter({current: true}).count();
        return fileCount === 0;
    }

    return {
        deleteDirsAndFilesInDirectoryFromProject,
    };
};
