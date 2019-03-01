const r = require('@lib/r');
const tutil = require('@lib/test-utils')(r);
const dirUtils = require('@dal/dir-utils')(r);
const path = require('path');
const os = require('os');
const fs = require('fs');
const mcdir = require('@lib/mcdir');

async function writeTemporaryFile() {
    let filename = await r.uuid();
    let filePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(filePath, 'hello world');
    return filePath;
}

async function createFileUploadEntry(filename, hash) {
    let createdFilePath = await writeTemporaryFile();
    let hashToUse = hash ? hash : await r.uuid();
    return {
        name: filename,
        hash: hashToUse,
        type: 'text/plain',
        size: 11,
        path: createdFilePath
    };
}

describe('Test addFileToDirectoryInProject', () => {
    test('it should add a brand new file', async() => {
        let project = await tutil.createTestProject();
        let [dir1] = await dirUtils.createDirsFromParent('dir1', project.root_dir.id, project.id);

        let fileToUploadEntry = await createFileUploadEntry('file1.txt');
        let uploadedFile = await dirUtils.addFileToDirectoryInProject(fileToUploadEntry, dir1.id, project.id, 'test@test.mc');
        let projectFilesCount = await r.table('project2datafile').getAll(project.id, {index: 'project_id'}).count();
        expect(projectFilesCount).toBe(1);
        expect(uploadedFile.name).toBe('file1.txt');
        expect(uploadedFile.checksum).toBe(fileToUploadEntry.hash);
        expect(uploadedFile.size).toBe(fileToUploadEntry.size);
        expect(uploadedFile.current).toBeTruthy();
        expect(uploadedFile.parent).toBe('');
        expect(mcdir.findFile(uploadedFile.id)).toBeTruthy();

        await tutil.deleteProject(project.id);
    });

    test('it should add a new version of an existing file with different checksum', async() => {
        // First upload original file and perform tests against it
        let project = await tutil.createTestProject();
        let [dir1] = await dirUtils.createDirsFromParent('dir1', project.root_dir.id, project.id);

        let fileToUploadEntry = await createFileUploadEntry('file2.txt');
        let uploadedFile = await dirUtils.addFileToDirectoryInProject(fileToUploadEntry, dir1.id, project.id, 'test@test.mc');
        let projectFilesCount = await r.table('project2datafile').getAll(project.id, {index: 'project_id'}).count();
        expect(projectFilesCount).toBe(1);
        expect(uploadedFile.name).toBe('file2.txt');
        expect(uploadedFile.checksum).toBe(fileToUploadEntry.hash);
        expect(uploadedFile.size).toBe(fileToUploadEntry.size);
        expect(uploadedFile.current).toBeTruthy();
        expect(uploadedFile.parent).toBe('');
        expect(mcdir.findFile(uploadedFile.id)).toBeTruthy();

        // Next upload a new version of the file
        let newVersionOfFileUploadEntry = await createFileUploadEntry('file2.txt');
        let newUploadedFile = await dirUtils.addFileToDirectoryInProject(newVersionOfFileUploadEntry, dir1.id, project.id, 'test@test.mc');
        projectFilesCount = await r.table('project2datafile').getAll(project.id, {index: 'project_id'}).count();
        expect(projectFilesCount).toBe(2);
        expect(newUploadedFile.name).toBe('file2.txt');
        expect(newUploadedFile.checksum).toBe(newVersionOfFileUploadEntry.hash);
        expect(newUploadedFile.size).toBe(newVersionOfFileUploadEntry.size);
        expect(newUploadedFile.current).toBeTruthy();
        expect(newUploadedFile.parent).toBe(uploadedFile.id);
        expect(mcdir.findFile(newUploadedFile.id)).toBeTruthy();

        // Make sure original file is not current
        let originalUploadedFile = await r.table('datafiles').get(uploadedFile.id);
        expect(originalUploadedFile.current).toBeFalsy();

        await tutil.deleteProject(project.id);

    });

    test('it should not do anything when adding an existing file with same checksum', async() => {
        // Create file in project
        let project = await tutil.createTestProject();
        let [dir1] = await dirUtils.createDirsFromParent('dir1', project.root_dir.id, project.id);

        let fileToUploadEntry = await createFileUploadEntry('file2.txt');
        let uploadedFile = await dirUtils.addFileToDirectoryInProject(fileToUploadEntry, dir1.id, project.id, 'test@test.mc');

        // Now upload the same file a second time
        let secondUpload = await dirUtils.addFileToDirectoryInProject(fileToUploadEntry, dir1.id, project.id, 'test@test.mc');
        let projectFilesCount = await r.table('project2datafile').getAll(project.id, {index: 'project_id'}).count();
        expect(projectFilesCount).toBe(1);
        expect(uploadedFile.id).toBe(secondUpload.id);
        expect(uploadedFile.name).toBe(secondUpload.name);
        expect(uploadedFile.checksum).toBe(secondUpload.checksum);
        expect(uploadedFile.size).toBe(secondUpload.size);
        expect(uploadedFile.current).toBeTruthy();
        expect(uploadedFile.parent).toBe('');
        expect(mcdir.findFile(uploadedFile.id)).toBeTruthy();
    });
});