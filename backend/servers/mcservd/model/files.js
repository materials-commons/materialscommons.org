const r = require('actionhero').api.r;
const runQuery = require('./run');
const db = require('./db');
const _ = require('lodash');
const model = require('./model');
const path = require('path');
const fileUtils = require('../lib/create-file-utils');

// get details on a file
async function get(file_id) {
    let rql = r.table('datafiles').get(file_id).merge(function() {
        return {
            tags: r.table('tag2item').getAll(file_id, {index: 'item_id'})
                .orderBy('tag_id')
                .pluck('tag_id').coerceTo('array'),
            notes: r.table('note2item').getAll(file_id, {index: 'item_id'})
                .eqJoin('note_id', r.table('notes')).zip().coerceTo('array'),
            samples: r.table('sample2datafile').getAll(file_id, {index: 'datafile_id'})
                .eqJoin('sample_id', r.table('samples')).zip()
                .distinct()
                .merge(sample => {
                    return {
                        processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                            .eqJoin('process_id', r.table('processes')).zip().orderBy('birthtime').coerceTo('array'),
                        files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                            .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
                    };
                })
                .coerceTo('array'),
            processes: r.table('process2file').getAll(file_id, {index: 'datafile_id'})
                .eqJoin('process_id', r.table('processes')).zip()
                .merge(function(proc) {
                    return {
                        setup: r.table('process2setup').getAll(proc('process_id'), {index: 'process_id'})
                            .eqJoin('setup_id', r.table('setups')).zip()
                            .merge(function(setup) {
                                return {
                                    properties: r.table('setupproperties')
                                        .getAll(setup('setup_id'), {index: 'setup_id'})
                                        .coerceTo('array')
                                }
                            }).coerceTo('array')
                    }
                }).distinct().coerceTo('array')
        }
    });
    return runQuery(rql);
}

async function getAllByChecksum(checksum) {
    return await r.table('datafiles').getAll(checksum, {index: 'checksum'});
}

async function clearUploadedFileByLocalPath(args) {
    let filepath = args.filepath;
    await fileUtils.removeFileByPath(filepath)
}

async function fetchOrCreateFileFromLocalPath(userid, args) {
    let filename = args.name;
    let checksum = args.checksum;
    let mediatype = args.mediatype;
    let filesize = args.filesize;
    let filepath = args.filepath;
    let parentFile = args.parent;

    let fileId = await r.uuid();
    let usesid = await determineUsesidIfNeeded(checksum);
    if (!usesid) {
        await fileUtils.moveToStore(filepath, fileId);
    } else {
        await fileUtils.removeFileByPath(filepath)
    }

    let fileArgs = {
        id: fileId,
        usesid: usesid,
        name: filename,
        mediatype: mediatype,
        size: filesize,
        checksum: checksum
    };
    let file = await create(fileArgs, userid);

    if (parentFile) {
        file = await pushVersion(file, parentFile);
    }
    return file;
}

async function determineUsesidIfNeeded(checksum) {
    let usesid = "";
    let checksumHit = await r.table('datafiles')
        .getAll(checksum, {index: 'checksum'});

    if (checksumHit && (checksumHit.length > 0)) {
        usesid = checksumHit[0].usesid ? checksumHit[0].usesid : checksumHit[0].id;
    }
    return usesid;
}

// create file
async function create(file, owner) {
    let usesid = file.usesid;
    if (!usesid) {
        usesid = await determineUsesidIfNeeded(file.checksum);
    }

    let f = new model.DataFile(file.name, owner);
    f.mediatype = file.mediatype;
    f.size = file.size;
    f.uploaded = file.size;
    f.checksum = file.checksum;
    f.usesid = usesid;

    if (file.id) {
        f.id = file.id;
    }

    let newFile = await db.insert('datafiles', f);

    return await get(newFile.id);
}

async function pushVersion(newFile, oldFile) {
    await r.table('datafiles').get(oldFile.id).update({current: false});
    await r.table('datafiles').get(newFile.id).update({parent: oldFile.id, current: true});
    return await get(newFile.id);
}

// getList gets the details for the given file ids
async function getList(projectID, fileIDs) {
    let rql = r.table('datafiles').getAll(r.args(fileIDs))
        .eqJoin('id', r.table('project2datafile'), {index: 'datafile_id'})
        .without([{right: 'id'}]).zip()
        .filter({project_id: projectID})
        .merge(function(file) {
            return {
                tags: r.table('tag2item').getAll(file('datafile_id'), {index: 'item_id'}).orderBy('tag_id').pluck(
                    'tag_id').coerceTo('array'),
                notes: r.table('note2item').getAll(file('datafile_id'), {index: 'item_id'}).eqJoin('note_id',
                    r.table('notes')).zip().coerceTo('array'),
                samples: r.table('sample2datafile').getAll(file('datafile_id'), {index: 'datafile_id'}).eqJoin(
                    'sample_id', r.table('samples')).zip().pluck('name', 'id').distinct().coerceTo('array'),
                processes: r.table('process2file').getAll(file('datafile_id'), {index: 'datafile_id'}).eqJoin(
                    'process_id', r.table('processes')).zip().pluck('name', 'id').distinct().coerceTo('array')
            }
        });
    return runQuery(rql);
}

// update file
async function update(fileID, projectID, user, file) {
    let updateFields = {};

    if (file.name) {
        updateFields.name = file.name;
        let isValid = await validateFileName(fileID, file.name);
        if (!isValid) {
            return {error: `file with name '${file.name}' already exists`};
        }
    }

    if (file.description) {
        updateFields.description = file.description;
    }

    if (updateFields.name || updateFields.description) {
        await db.update('datafiles', fileID, updateFields);
    }

    if (file.tags) {
        await updateTags(fileID, file.tags);
    }

    if (file.notes) {
        await updateNotes(fileID, projectID, user, file.notes);
    }

    if (file.processes) {
        await updateProcesses(fileID, file.processes);
    }

    if (file.samples) {
        await updateSamples(fileID, file.samples);
    }

    if (file.move) {
        await moveFile(fileID, projectID, file.move);
    }

    let newVal = await get(fileID);
    return {val: newVal};
}

// validateFileName ensures that the file name doesn't already exist in
// the given directory. This is used when a file is being renamed.
async function validateFileName(fileID, fileName) {
    let rql = r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'})
        .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
        .eqJoin('datafile_id', r.table('datafiles')).zip()
        .filter({name: fileName})
        .count();
    let matchingNameCount = await runQuery(rql);
    return matchingNameCount === 0;
}

// updateTags updates the list of tags associated with a file. It takes a
// list of tags, compares that to the current tags associated with the
// file and adds or removes tags as needed.
async function updateTags(fileID, tags) {
    let rql = r.table('tag2item').getAll(fileID, {index: 'item_id'});
    let tagsFromDB = await runQuery(rql);
    let currentTags = tagsFromDB.map(t => t.tag_id);
    let tagsFlat = tags.map(t => t.tag_id);
    let tagsDeleted = _.difference(currentTags, tagsFlat);
    let tagsAdded = _.difference(tagsFlat, currentTags);
    if (tagsDeleted.length) {
        await deleteTags(tagsDeleted, tagsFromDB);
    }

    if (addTags.length) {
        await addTags(tagsAdded, fileID);
    }
    return true;
}

// deleteTags will delete tags associated with a file.
async function deleteTags(tagsDeleted, tagsFromDB) {
    let tagsHash = [];
    tagsFromDB.forEach(t => tagsHash[t.tag_id] = t);
    let tagsToDelete = tagsDeleted.map(t => tagsHash[t].id);
    let rql = r.table('tag2item').getAll(r.args(tagsToDelete)).delete();
    return await runQuery(rql);
}

// addTags will add tags to a file.
async function addTags(tagsAdded, fileID) {
    let tagsToAdd = [] = tagsAdded.map(t => new model.Tag2Item(t, fileID, 'datafile'));
    let rql = r.table('tag2item').insert(tagsToAdd);
    return await runQuery(rql);
}

// updateNotes adds, modifies or deletes notes associated with a file. It
// takes a list of notes and for each note determines if that note is being
// updated, removed, or created.
async function updateNotes(fileID, projectID, user, notes) {
    for (let note of notes) {
        if (note.id && note.delete) {
            await deleteNote(note);
        } else if (note.id) {
            await updateNote(note);
        } else {
            await addNote(note, fileID, user, projectID);
        }
    }
    return true;
}

// deleteNote deletes a given note.
async function deleteNote(note) {
    await r.table('notes').get(note.id).delete();
    return await r.table('note2item').getAll(note.id, {index: 'note_id'}).delete();
}

// updateNote updates a given note. The only fields that can be changed are the title and/or the note field.
async function updateNote(note) {
    let n = {};
    if (note.title) {
        n.title = note.title;
    }
    if (note.note) {
        n.note = note.note;
    }
    n.mtime = r.now();
    return await r.table('notes').get(note.id).update(n);
}

// addNote adds a new note and associates it with the given file.
async function addNote(note, fileID, owner, projectID) {
    let n = new model.Note(note.title, note.note, projectID, owner);
    let newNote = await db.insert('notes', n);
    let note2item = new model.Note2Item(fileID, 'datafile', newNote.id);
    return await db.insert('note2item', note2item);
}

// updateProcesses will add or delete process associations for the file
async function updateProcesses(fileID, processes) {
    let processesForFile = await r.table('process2file').getAll(fileID, {index: 'datafile_id'});
    let processesMap = [];

    // A file can be used in one or both directions (in or out). Build a map of process id
    // and direction. This way we don't add a file in the same direction to a process when
    // that file and direction already exists for a process.
    processesForFile.forEach(p => processesMap[`${p.process_id}_${p.direction}`] = p);
    let processesToAdd = processes.filter(p => p.command === 'add').filter(
        p => !(`${p.process_id}_${p.direction}` in processesMap)).map(
        p => new model.Process2File(p.process_id, fileID, p.direction));
    let processesToDelete = processes.filter(p => p.command === 'delete').map(p => p.process_id);

    if (processesToAdd.length) {
        await r.table('process2file').insert(processesToAdd);
    }

    if (processesToDelete.length) {
        await r.table('process2file').getAll(processesToDelete, {index: 'process_id'}).delete();
    }
}

// updateSamples will add or delete sample associations for the file
async function updateSamples(fileID, samples) {

}

// deleteFile deletes a file if that file is not currently used in any
// processes or samples. It also removes all the files notes.
async function deleteFile(fileID) {
    let f = await get(fileID);

    if (f.samples.length) {
        return {error: 'File used in samples'};
    } else if (f.processes.length) {
        return {error: 'File used in processes'};
    }

    if (f.notes.length) {
        let noteIDs = f.notes.map(n => n.id);
        await r.table('notes').getAll(r.args(noteIDs)).delete();
        await r.table('note2item').getAll(r.args(noteIDs), {index: 'note_id'}).delete();
    }

    await r.table('datafiles').get(fileID).delete();
    await r.table('project2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    await r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    await r.table('experiment2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    await deletePhysicalFileIfAppropriate(f);
    return {val: f};
}

async function deletePhysicalFileIfAppropriate(file) {
    let count = await r.table('datafiles').getAll(file.checksum, {index: 'checksum'}).count();
    if (count === 0) {
        let baseId = file.id;
        if (file.usesid) {
            baseId = file.usesid;
        }
        await fileUtils.removeFileInStore(baseId);
    }
}

async function byPath(projectID, filePath) {
    let fileName = path.basename(filePath);
    let dir = path.dirname(filePath);
    let rql = r.table('datadirs').getAll(dir, {index: 'name'})
        .eqJoin('id', r.table('project2datadir'), {index: 'datadir_id'}).zip()
        .filter({project_id: projectID})
        .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
        .eqJoin('datafile_id', r.table('datafiles')).zip()
        .filter({current: true, name: fileName});
    let matches = await runQuery(rql);
    if (!matches.length || matches.length !== 1) {
        return {error: 'No matching file'};
    }
    let f = matches[0];
    f['birthtime'] = f['birthtime'].epoch_time;
    f['mtime'] = f['mtime'].epoch_time;
    f['atime'] = f['atime'].epoch_time;
    return {val: f};
}

async function moveFile(fileID, projectID, moveArgs) {
    // Make sure new directoryID is in project.
    let findDirRql = r.table('project2datadir')
        .getAll([projectID, moveArgs.new_directory_id], {index: 'project_datadir'});
    let matches = await runQuery(findDirRql);
    if (!matches.length) {
        return {error: 'Directory not in project'};
    }
    // Move file to directory by getting the original entry and updating it
    // to the new directory.
    await r.table('datadir2datafile')
        .getAll([moveArgs.old_directory_id, fileID], {index: 'datadir_datafile'})
        .update({datadir_id: moveArgs.new_directory_id});
    return {val: true};
}

async function getVersions(fileID) {
    // get original file
    let f = await runQuery(r.table('datafiles').get(fileID));
    if (!f) {
        return {error: 'No such file'};
    } else if (f.parent === '') {
        return {val: []};
    }

    // get all files in the given files directory
    // normally, prefetch all potential parents
    let rql = r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'})
        .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
        .eqJoin('datafile_id', r.table('datafiles')).zip();
    let allDirFiles = await runQuery(rql);
    let filesIdMap = _.keyBy(allDirFiles, 'id');

    let fileList = [];
    let current = f;
    while (current.parent) {
        let file = filesIdMap[current.parent];
        if (!file) { // in rare cases, the file may have been moved!
            file = await get(current.parent);
        }
        fileList.push(file);
        current = file;
    }

    return {val: fileList};
}

module.exports = {
    get,
    getAllByChecksum,
    getList,
    fetchOrCreateFileFromLocalPath,
    clearUploadedFileByLocalPath,
    create,
    update,
    pushVersion,
    deleteFile,
    byPath,
    getVersions
};
