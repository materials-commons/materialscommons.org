const mtype = require('../../mediatype');
const model = require('../../../../shared/model');
const fs = require('fs');
const mcdir = require('../../mcdir');

module.exports = function(r) {
    const db = require('../db')(r);

    const addFileToDirectoryInProject = async(fileToUpload, directoryId, projectId, userId) => {
        let fileEntry = {
            // Create the id for the file being uploaded as this will determine
            // the location of the uploaded file in our object store.
            id: await r.uuid(),
            name: fileToUpload.name,
            checksum: fileToUpload.hash,
            mediatype: mtype.mediaTypeDescriptionsFromMime(fileToUpload.type),
            size: fileToUpload.size,
            path: fileToUpload.path,
            owner: userId,
            parentId: '',
        };

        let file = await getFileByNameInDirectory(fileToUpload.name, directoryId);
        if (!file) {
            // There is no existing file with this name in the directory.
            fileEntry.usesid = await findMatchingFileIdByChecksum(fileEntry.checksum);
            return await loadNewFileIntoDirectory(fileEntry, directoryId, projectId);
        } else if (file.checksum !== fileEntry.checksum) {
            // There is an existing file in the directory but it has a different
            // checksum, so we have to do a little book keeping to make this file
            // the current file, set its parent entry back to the existing, as well
            // as do the usual steps for uploading a file into the object store.
            fileEntry.usesid = await findMatchingFileIdByChecksum(fileEntry.checksum);
            return await loadExistingFileIntoDirectory(file, fileEntry, directoryId, projectId);
        } else {
            // If we are here then there is a file with the same name in the directory
            // and it has the same checksum. In that case there is nothing to load
            // into the database as the user is attempting to upload an existing
            // file (name and checksum match the existing file).
            await removeFile(fileEntry.path);
            return file;
        }
    };

    // getFileByNameInDirectory will return the current file in the directory
    // that matches the filename. This is used to construct multiple versions
    // of a file, with only one version being the current one.
    const getFileByNameInDirectory = async(fileName, directoryId) => {
        let file = await r.table('datadir2datafile').getAll(directoryId, {index: 'datadir_id'})
            .eqJoin('datafile_id', r.table('datafiles')).zip()
            .filter({name: fileName, current: true});
        if (file) {
            return file[0]; // query returns an array of 1 entry.
        }

        return null;
    };

    const loadNewFileIntoDirectory = async(fileEntry, directoryId, projectId) => {
        await addToObjectStore(fileEntry);
        return await createFile(fileEntry, directoryId, projectId);
    };

    const loadExistingFileIntoDirectory = async(parent, fileEntry, directoryId, projectId) => {
        await addToObjectStore(fileEntry);

        fileEntry.parentId = parent.id;
        let created = await createFile(fileEntry, directoryId, projectId);

        // Parent is no longer the current file
        await r.table('datafiles').get(parent.id).update({current: false});

        return created;
    };

    const addToObjectStore = async(fileEntry) => {
        if (fileEntry.usesid === '') {
            // This is a brand new file so move into the object store.
            await mcdir.moveIntoStore(fileEntry.path, fileEntry.id);
        } else {
            // There is already a file in the store with the same checksum
            // so delete uploaded file.
            await removeFile(fileEntry.path);
        }
    };

    // findMatchingFileIdByChecksum will return the id of the file that
    // was uploaded with the name checksum or "" if there is no match.
    const findMatchingFileIdByChecksum = async(checksum) => {
        let matching = await r.table('datafiles').getAll(checksum, {index: 'checksum'});
        if (matching.length) {
            // Multiple entries have been found that have the same checksum. In the database
            // a file has a usesid which points to the original entry that was first uploaded
            // with the matching checksum. So, we take the first entry in the list, it is
            // either this original upload, or a file with a usesid that points to the original
            // upload. We can determine this by checking if usesid === "". If it is return the
            // id, otherwise return the usesid.
            return matching[0].usesid === '' ? matching[0].id : matching[0].usesid;
        }

        // If we are here then there was no match found, so just return "" to signify no match.
        return '';
    };

    const removeFile = async(path) => {
        try {
            fs.unlinkSync(path);
        } catch (e) {
            console.log('unlink error', e);
            return false;
        }
    };

    const createFile = async(fileEntry, directoryId, projectId) => {
        let file = new model.DataFile(fileEntry.name, fileEntry.owner);
        file.mediatype = fileEntry.mediatype;
        file.size = fileEntry.size;
        file.uploaded = file.size;
        file.checksum = fileEntry.checksum;
        file.usesid = fileEntry.usesid;
        file.id = fileEntry.id;
        file.parent = fileEntry.parentId;

        let created = await db.insert('datafiles', file);

        await addFileToDirectory(created.id, directoryId);
        await addFileToProject(created.id, projectId);

        return created;
    };

    const addFileToDirectory = async(fileId, directoryId) => {
        const dd2df = new model.DataDir2DataFile(directoryId, fileId);
        await r.table('datadir2datafile').insert(dd2df);
    };

    const addFileToProject = async(fileId, projectId) => {
        let p2df = new model.Project2DataFile(projectId, fileId);
        await r.table('project2datafile').insert(p2df);
    };

    return {
        addFileToDirectoryInProject,
    };
};