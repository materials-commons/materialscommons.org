const r = require('../../../../shared/r');
const mcdir = require('../../mcdir');

const deleteDirsAndFilesInDirectoryFromProject = async(filesAndDirs, directoryId, projectId) => {
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
};

const checkAllFilesInDir = async(files, directoryId) => {
    let indexArgs = files.map(f => [directoryId, file.id]);
    let count = await r.table('datafiles').getAll(r.args(indexArgs), {index: 'datadir_datafile'}).count();
    return count === files.length;
};

const checkAllDirsInDir = async(dirs, directoryId) => {
    let indexArgs = files.map(d => [d.id, directoryId]);
    let count = await r.table('datadirs').getAll(r.args(indexArgs), {index: 'datadir_parent'}).count();
    return count === dirs.length;
};

/*
function* allProcessesInDataset(datasetId, processIds) {
    let indexArgs = processIds.map(id => [datasetId, id]);
    let processes = yield r.table('dataset2process').getAll(r.args(indexArgs), {index: 'dataset_process'});
    return processes.length === processIds.length;
}
 */

const deleteFilesFromDirectory = async(files, directoryId) => {
    let fileResults = [];
    for (let file of files) {
        fileResults.push(await deleteFileInDirectory(file.id, directoryId, false));
    }

    return fileResults;
};

// deleteFileInDirectoryFromProject will delete the file and all the associations. The allowIfUsed
// flag will allow the file to be deleted if it is used in any samples or processes.
const deleteFileInDirectory = async(fileId, directoryId, allowIfUsed) => {
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
};

// checkFileNotUsed checks if the file is referenced by any processes, samples or datasets
// and returns an error msg if it is.
const checkFileNotUsed = async(fileId) => {
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
};

// getFileInDirHandlingErrors will attempt to the get file. If there are any errors it will
// return null.
const getFileInDirHandlingErrors = async(fileId, directoryId) => {
    let file;
    try {
        file = await r.table('datadir2datafile').getAll([directoryId, fileId], {index: 'datadir_datafile'})
            .eqJoin('datafile_id', r.table('datafiles')).zip().nth(0);
    } catch (e) {
        file = null;
    }

    return file;
};

const deleteFileAssociations = async(fileId) => {
    // delete associations
    await deleteFileFromJoinTable(fileId, 'datadir2datafile');
    await deleteFileFromJoinTable(fileId, 'dataset2datafile');
    await deleteFileFromJoinTable(fileId, 'experiment2datafile');
    await deleteFileFromJoinTable(fileId, 'measurement2datafile');
    await deleteFileFromJoinTable(fileId, 'project2datafile');
    await deleteFileFromJoinTable(fileId, 'sample2datafile');
    await deleteFileFromJoinTable(fileId, 'process2file');
};

const deleteFileFromJoinTable = async(fileId, tableName) => {
    await r.table(tableName).getAll(fileId, {index: 'datafile_id'}).delete();
};

const deleteOnDiskFileIfNoReferences = async(file) => {
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
};

const deleteDirsFromProject = async(dirs, directoryId, projectId) => {
    let dirResults = [];
    for (let dir of dirs) {
        dirResults.push(await deleteDirInDirectoryFromProject(dir.id, directoryId, projectId));
    }

    return dirResults;
};

const deleteDirInDirectoryFromProject = async(dirId, directoryId, projectId) => {

};

module.exports = {
    deleteDirsAndFilesInDirectoryFromProject,
};

