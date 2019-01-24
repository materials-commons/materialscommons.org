#!/usr/bin/env node
'use strict';
const path = require('path');

const program = require('commander');
const Promise = require("bluebird");
const fsa = Promise.promisifyAll(require("fs"));
const achiver = require('archiver');
const fs = require('fs');

const mkdirpAsync = Promise.promisify(require('mkdirp'));
const zipFileUtils = require('../servers/lib/zipFileUtils.js');

const defaultPort =  28015; // true default
// const defaultPort = 30815; // localhost version

let parameters = getControlParameters();

var port = parameters.port;
var base = parameters.base;
var zipbase = parameters.zipbase;
var replace = !!parameters.replace;
var idList = parameters.id;
var all = !!parameters.all;
var numberProcessed = 0;
var totalNumberToProcess = 0;
var pathForFileInZip = "Dataset/";

main();

function main() {

    verifyParameters();

    reportParameters();

    if (base) {
        zipFileUtils.setBase(base);
    }
    if (zipbase) {
        zipFileUtils.setZipDirPath(zipbase);
    }

    Promise.coroutine(buildZipFiles)();
}

function* buildZipFiles() {
    try {
        console.log("setup");
        var r = require('rethinkdbdash')({
            db: 'materialscommons',
            port: port
        });
        console.log("setup done");

        var idSet = new Set(idList);
        var ids = (idList.length > 0);

        let allDatasetIds = yield r.db('materialscommons').table('datasets').pluck(["id", "published"]);

        var idsToProcess = [];
        allDatasetIds.forEach(record => {
            let id = record['id'];
            if (all || (ids && (idSet.has(id)))) {
                if (record['published']) {
                    idsToProcess.push(id);
                } else {
                    console.log("No zip will be created for unpublished dataset: " + id);
                }
            }
        });

        console.log("Zip files to be created for " + idsToProcess.length + " datasets");

        if (idsToProcess.length == 0) {
            return Promise.reject("Error: no dataset id values to process");
        }

        totalNumberToProcess = idsToProcess.length;

        for (var i = 0; i < idsToProcess.length; i++) {
            var id = idsToProcess[i];
            Promise.coroutine(
                publishDatasetZipFile
            )(r, id);
        }

    } catch (error) {
        console.log("Error in buildZipFiles: ", error)
    }
}

function* publishDatasetZipFile(r, datasetId) {
    try {
        console.log("zip", datasetId);
        let ds = yield r.db('materialscommons').table('datasets').get(datasetId);
        let zipDirPath = zipFileUtils.zipDirPath(ds);
        let zipFileName = zipFileUtils.zipFilename(ds);
        let fillPathAndFilename = zipFileUtils.fullPathAndFilename(ds);

        console.log("full path and filename: ", fillPathAndFilename);
        if (fs.existsSync()) {
            return new Promise(function(resolve) {
                resolve();
            });
        }

        let ds2dfEntries = yield r.db('materialscommons').table('dataset2datafile')
            .getAll(datasetId, {index: 'dataset_id'}).coerceTo('array');

        if (!ds2dfEntries.length) {
            numberProcessed++;
            console.log('no zip for id = ' + datasetId);
            console.log('total number of zip files processed: ' + numberProcessed + " of " + totalNumberToProcess);
            return new Promise(function (resolve, reject) {
                resolve()
            });
        }

        yield mkdirpAsync(zipDirPath);

        let datafileIds = ds2dfEntries.map(entry => entry.datafile_id);
        let datafiles = yield r.table('datafiles').getAll(r.args(datafileIds))
            .merge((df) => {
                return {
                    dir: r.table('datadir2datafile').getAll(df('id'), {index: 'datafile_id'})
                        .eqJoin('datadir_id', r.table('datadirs')).zip().coerceTo('array')
                }
            });
        let nameSourceList = [];
        var seenThisOne = {};

        for (var i = 0; i < datafiles.length; i++) {
            let df = datafiles[i];

            let zipEntry = zipFileUtils.zipEntry(df); // sets fileName, checksum, filePath, sourcePath
            let filePath = zipEntry.filePath;
            let path = zipEntry.sourcePath;
            let name = zipEntry.fileName;

            console.log('-------------');
            console.log('name = ', name);
            console.log('filePath = ', filePath);
            console.log('sourcePath = ', path);
            console.log('name = ',name);

            let checksum = zipEntry.checksum;
            name = resolveZipfileFilenameDuplicates(seenThisOne, name, checksum);
            let stream = fsa.createReadStream(path, {
                flags: 'r',
                encoding: null,
                fd: null,
                mode: 0o666,
                autoClose: true
            });
            nameSourceList.push({name: name, path: filePath, source: stream});
        }

        console.log("For id = " + datasetId + ", there are " + nameSourceList.length + " files");

        var output = fsa.createWriteStream(fillPathAndFilename);

        let retP = new Promise(function (resolve, reject) {
            var archive = achiver('zip');

            output.on('close', function () {
                let zipfileSize = archive.pointer();
                console.log('for dataset: ' + datasetId + " with " + zipfileSize + ' total bytes');
                numberProcessed++;
                console.log('total number of zip files processed: ' + numberProcessed + " of " + totalNumberToProcess);
                let zip = {size: zipfileSize, filename: zipFileName};
                r.db('materialscommons').table('datasets').get(datasetId).update({zip: zip}).then(() => {
                    resolve();
                    if (numberProcessed == totalNumberToProcess) {
                        process.exit(0);
                    }
                });
            });

            archive.on('error', reject);

            archive.on('close', function () {
                console.log('archive close');
            });

            archive.pipe(output);

            nameSourceList.forEach(ns => {
                let pathAndName = pathForFileInZip + ns.path + ns.name;
                archive.append(ns.source, {name: pathAndName});
            });

            archive.finalize();
        });

        console.log("Starting of zip file For id = " + datasetId + "... (wait)");

        return retP;

    } catch (error) {
        return yield Promise.reject("Error in publishDatasetZipFile: " + error.message);
    }
}

function resolveZipfileFilenameDuplicates(seenThisOne, name, checksum) {
    name = name.toLowerCase();

    if (name.startsWith(".")) {
        name = "dot_" + name;
    }

    if (name in seenThisOne) {
        var count = 0;
        if (seenThisOne[name] == checksum) {
            console.log("Seen this file before: " + name);
            return null;
        } else {
            let newName = resolveZipfileFilenameUnique(name, count);
            while (newName in seenThisOne) {
                count++;
                newName = resolveZipfileFilenameUnique(name, count);
            }
            // console.log(name + " --> " + newName);
            name = newName;
        }
    }
    seenThisOne[name] = checksum;
    return name;
}

function resolveZipfileFilenameUnique(name, count) {
    let parts = path.parse(name);
    return parts.name + "_" + count + parts.ext;
}

function verifyParameters() {
    var ids = (idList.length > 0);

    if (!all && !ids) {
        program.help(text => {
            var banner = "\t--------------------------------\n";
            return banner + "\tOne of --id or --all is required\n"
                + banner + text;
        })
    }

    if (ids && all) {
        console.log("WARNING: --all (or -a) was specified, but one of more id valeus were given\n"
            + "\tThe id values take precident");
    }

    if (ids) {
        all = false;
    }

}

function reportParameters() {
    console.log("use --help for list of parameter options");
    console.log("port = " + port);
    console.log("base = " + base);
    console.log("zipbase = " + zipbase);
    console.log("replace = " + replace);
    if (all) {
        console.log("process all")
    } else {
        console.log("input id(s)");
        idList.forEach(id => {
            console.log("\tid = " + id);
        });
    }
}

function getControlParameters() {
    let accumulateIds = (id, ids) => {
        ids.push(id);
        return ids;
    };

    return program
        .option('-p, --port [port]', 'The RethinkDB port; defaults to ' + defaultPort, defaultPort)
        .option('-b, --base [base]', 'The base path of the datasets directory, optional')
        .option('-z, --zipbase [zipbase]', 'The base path for the zipfile directory, optional')
        .option('-i, --id [id]', 'If given, the id of the dataset to copy, can be repeated', accumulateIds, [])
        .option('-a, --all', 'If given, and no id(s), then copy all datasets, \n\t\tone of --id or --all required')
        .option('-r, --replace', 'If given, then replace files already generated, \n\t\totherwise not; optional')
        .parse(process.argv);
}
