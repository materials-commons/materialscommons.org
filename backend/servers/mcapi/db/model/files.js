const r = require('../r');
const runQuery = require('./run');
const db = require('./db');
const _ = require('lodash');
const model = require('./model');
const path = require('path');
const fileUtils = require('../../../lib/create-file-utils');

// get details on a file
function* get(file_id) {
    let rql = r.table('datafiles').get(file_id).merge(function () {
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
                .merge(function (proc) {
                    return {
                        setup: r.table('process2setup').getAll(proc('process_id'), {index: 'process_id'})
                            .eqJoin('setup_id', r.table('setups')).zip()
                            .merge(function (setup) {
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

function* getFileDatasets(fileId) {
    return yield r.table("dataset2datafile").getAll("datafile_id", fileId)
        .eqJoin("dataset_id", r.table("datasets")).zip();
}

function* getFileSimple(fileId) {
    return yield r.table('datafiles').get(fileId);
}

function* getAllByChecksum(checksum) {
    return yield r.table('datafiles').getAll(checksum, {index: 'checksum'});
}

function* clearUploadedFileByLocalPath(args) {
    let filepath = args.filepath;
    yield fileUtils.removeFileByPath(filepath)
}

function* fetchOrCreateFileFromLocalPath(userid, args) {
    let filename = args.name;
    let checksum = args.checksum;
    let mediatype = args.mediatype;
    let filesize = args.filesize;
    let filepath = args.filepath;
    let parentFile = args.parent;

    let fileId = yield r.uuid();
    let usesid = yield determineUsesidIfNeeded(checksum);
    if (!usesid) {
        yield fileUtils.moveToStore(filepath, fileId);
    } else {
        yield fileUtils.removeFileByPath(filepath)
    }

    let fileArgs = {
        id: fileId,
        usesid: usesid,
        name: filename,
        mediatype: mediatype,
        size: filesize,
        checksum: checksum
    };
    let file = yield create(fileArgs, userid);

    if (parentFile) {
        file = yield pushVersion(file, parentFile);
    }
    return file;
}

function* determineUsesidIfNeeded(checksum) {
    let usesid = "";
    let checksumHit = yield r.table('datafiles')
        .getAll(checksum, {index: 'checksum'});

    if (checksumHit && (checksumHit.length > 0)) {
        usesid = checksumHit[0].usesid ? checksumHit[0].usesid : checksumHit[0].id;
    }
    return usesid;
}

// create file
function* create(file, owner) {
    let usesid = file.usesid;
    if (!usesid) {
        usesid = yield determineUsesidIfNeeded(file.checksum);
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

    let newFile = yield db.insert('datafiles', f);

    return yield get(newFile.id);
}

function* pushVersion(newFile, oldFile) {
    yield r.table('datafiles').get(oldFile.id).update({current: false});
    yield r.table('datafiles').get(newFile.id).update({parent: oldFile.id, current: true});
    return yield get(newFile.id);
}

// getList gets the details for the given file ids
function* getList(projectID, fileIDs) {
    let rql = r.table('datafiles').getAll(r.args(fileIDs))
        .eqJoin('id', r.table('project2datafile'), {index: 'datafile_id'})
        .without([{right: 'id'}]).zip()
        .filter({project_id: projectID})
        .merge(function (file) {
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
function* update(fileID, projectID, user, file) {
    let updateFields = {};

    if (file.name) {
        updateFields.name = file.name;
        let isValid = yield validateFileName(fileID, file.name);
        if (!isValid) {
            return {error: `file with name '${file.name}' already exists`};
        }
    }

    if (file.description) {
        updateFields.description = file.description;
    }

    if (updateFields.name || updateFields.description) {
        yield db.update('datafiles', fileID, updateFields);
    }

    if (file.tags) {
        yield updateTags(fileID, file.tags);
    }

    if (file.notes) {
        yield updateNotes(fileID, projectID, user, file.notes);
    }

    if (file.processes) {
        yield updateProcesses(fileID, file.processes);
    }

    if (file.samples) {
        yield updateSamples(fileID, file.samples);
    }

    if (file.move) {
        yield moveFile(fileID, projectID, file.move);
    }

    let newVal = yield get(fileID);
    return {val: newVal};
}

// validateFileName ensures that the file name doesn't already exist in
// the given directory. This is used when a file is being renamed.
function* validateFileName(fileID, fileName) {
    let rql = r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'})
        .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
        .eqJoin('datafile_id', r.table('datafiles')).zip()
        .filter({name: fileName})
        .count();
    let matchingNameCount = yield runQuery(rql);
    return matchingNameCount === 0;
}

// updateTags updates the list of tags associated with a file. It takes a
// list of tags, compares that to the current tags associated with the
// file and adds or removes tags as needed.
function* updateTags(fileID, tags) {
    let rql = r.table('tag2item').getAll(fileID, {index: 'item_id'});
    let tagsFromDB = yield runQuery(rql);
    let currentTags = tagsFromDB.map(t => t.tag_id);
    let tagsFlat = tags.map(t => t.tag_id);
    let tagsDeleted = _.difference(currentTags, tagsFlat);
    let tagsAdded = _.difference(tagsFlat, currentTags);
    if (tagsDeleted.length) {
        yield deleteTags(tagsDeleted, tagsFromDB);
    }

    if (addTags.length) {
        yield addTags(tagsAdded, fileID);
    }
    return true;
}

// deleteTags will delete tags associated with a file.
function* deleteTags(tagsDeleted, tagsFromDB) {
    let tagsHash = [];
    tagsFromDB.forEach(t => tagsHash[t.tag_id] = t);
    let tagsToDelete = tagsDeleted.map(t => tagsHash[t].id);
    let rql = r.table('tag2item').getAll(r.args(tagsToDelete)).delete();
    return yield runQuery(rql);
}

// addTags will add tags to a file.
function* addTags(tagsAdded, fileID) {
    let tagsToAdd = [] = tagsAdded.map(t => new model.Tag2Item(t, fileID, 'datafile'));
    let rql = r.table('tag2item').insert(tagsToAdd);
    return yield runQuery(rql);
}

// updateNotes adds, modifies or deletes notes associated with a file. It
// takes a list of notes and for each note determines if that note is being
// updated, removed, or created.
function* updateNotes(fileID, projectID, user, notes) {
    for (let note of notes) {
        if (note.id && note.delete) {
            yield deleteNote(note);
        } else if (note.id) {
            yield updateNote(note);
        } else {
            yield addNote(note, fileID, user, projectID);
        }
    }
    return true;
}

// deleteNote deletes a given note.
function* deleteNote(note) {
    yield r.table('notes').get(note.id).delete();
    return yield r.table('note2item').getAll(note.id, {index: 'note_id'}).delete();
}

// updateNote updates a given note. The only fields that can be changed are the title and/or the note field.
function* updateNote(note) {
    let n = {};
    if (note.title) {
        n.title = note.title;
    }
    if (note.note) {
        n.note = note.note;
    }
    n.mtime = r.now();
    return yield r.table('notes').get(note.id).update(n);
}

// addNote adds a new note and associates it with the given file.
function* addNote(note, fileID, owner, projectID) {
    let n = new model.Note(note.title, note.note, projectID, owner);
    let newNote = yield db.insert('notes', n);
    let note2item = new model.Note2Item(fileID, 'datafile', newNote.id);
    return yield db.insert('note2item', note2item);
}

// updateProcesses will add or delete process associations for the file
function* updateProcesses(fileID, processes) {
    let processesForFile = yield r.table('process2file').getAll(fileID, {index: 'datafile_id'});
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
        yield r.table('process2file').insert(processesToAdd);
    }

    if (processesToDelete.length) {
        yield r.table('process2file').getAll(processesToDelete, {index: 'process_id'}).delete();
    }
}

// updateSamples will add or delete sample associations for the file
function* updateSamples(fileID, samples) {

}

// deleteFile deletes a file if that file is not currently used in any
// processes or samples. It also removes all the files notes.
function* deleteFile(fileID) {
    let f = yield get(fileID);

    if (f.samples.length) {
        return {error: 'File used in samples'};
    } else if (f.processes.length) {
        return {error: 'File used in processes'};
    }

    if (f.notes.length) {
        let noteIDs = f.notes.map(n => n.id);
        yield r.table('notes').getAll(r.args(noteIDs)).delete();
        yield r.table('note2item').getAll(r.args(noteIDs), {index: 'note_id'}).delete();
    }

    yield r.table('datafiles').get(fileID).delete();
    yield r.table('project2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    yield r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    yield r.table('experiment2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
    yield deletePhysicalFileIfAppropriate(f);
    return {val: f};
}

function* deletePhysicalFileIfAppropriate(file) {
    let count = yield r.table('datafiles').getAll(file.checksum, {index: 'checksum'}).count();
    if (count === 0) {
        let baseId = file.id;
        if (file.usesid) {
            baseId = file.usesid;
        }
        yield fileUtils.removeFileInStore(baseId);
    }
}

function* byPath(projectID, filePath) {
    let fileName = path.basename(filePath);
    let dir = path.dirname(filePath);
    let rql = r.table('datadirs').getAll(dir, {index: 'name'})
        .eqJoin('id', r.table('project2datadir'), {index: 'datadir_id'}).zip()
        .filter({project_id: projectID})
        .eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip()
        .eqJoin('datafile_id', r.table('datafiles')).zip()
        .filter({current: true, name: fileName});
    let matches = yield runQuery(rql);
    if (!matches.length || matches.length !== 1) {
        return {error: 'No matching file'};
    }
    let f = matches[0];
    f['birthtime'] = f['birthtime'].epoch_time;
    f['mtime'] = f['mtime'].epoch_time;
    f['atime'] = f['atime'].epoch_time;
    return {val: f};
}

function* moveFile(fileID, projectID, moveArgs) {
    // Make sure new directoryID is in project.
    let findDirRql = r.table('project2datadir')
        .getAll([projectID, moveArgs.new_directory_id], {index: 'project_datadir'});
    let matches = yield runQuery(findDirRql);
    if (!matches.length) {
        return {error: 'Directory not in project'};
    }
    // Move file to directory by getting the original entry and updating it
    // to the new directory.
    yield r.table('datadir2datafile')
        .getAll([moveArgs.old_directory_id, fileID], {index: 'datadir_datafile'})
        .update({datadir_id: moveArgs.new_directory_id});
    return {val: true};
}

function* getVersions(fileID) {
    // get original file
    let f = yield runQuery(r.table('datafiles').get(fileID));
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
    let allDirFiles = yield runQuery(rql);
    let filesIdMap = _.keyBy(allDirFiles, 'id');

    let fileList = [];
    let current = f;
    while (current.parent) {
        let file = filesIdMap[current.parent];
        if (!file) { // in rare cases, the file may have been moved!
            file = yield get(current.parent);
        }
        fileList.push(file);
        current = file;
    }

    return {val: fileList};
}

function* getFileProjects(fileId) {
    return yield r.table("datadir2datafile").getAll("datafile_id", fileId)
        .eqJoin("datadir_id", r.table("project2datadir"), {index: "datadir_id"}).zip()
        .eqJoin("project_id", r.Table("projects")).zip()
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
    getVersions,
    getFileDatasets,
    getFileSimple,
    getFileProjects
};
