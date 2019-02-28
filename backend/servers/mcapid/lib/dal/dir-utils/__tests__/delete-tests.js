const r = require('@lib/r');
const tutil = require('@lib/test-utils')(r);
const {deleteDirsAndFilesInDirectoryFromProject, createDirsFromParent} = require('@dal/dir-utils')(r);

describe('Test deleteDirsAndFilesInDirectoryFromProject', () => {
    let project;
    let dir1, dir2;
    let fileInDir1;
    beforeAll(async() => {
        project = await tutil.createTestProject();
        dir1 = await createDirsFromParent('dir1', project.root_dir.id, project.id);
        dir2 = await createDirsFromParent('dir2', project.root_dir.id, project.id);
        dir1 = dir1[0];
        dir2 = dir2[0];
        fileInDir1 = await tutil.createFile('file1.txt', dir1.id, project.id);
    });

    afterAll(async() => {
        tutil.deleteProject(project.id);
    });

    test('it returns zero length results when no files and directories are given', async() => {
        let results = await deleteDirsAndFilesInDirectoryFromProject([], project.root_dir.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(0);
    });

    test('it return an error result for directories when trying to delete directories not in directory', async() => {
        let results = await deleteDirsAndFilesInDirectoryFromProject([{otype: 'directory', id: dir2.id}], dir1.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(1);
        expect(results.directories[0].error).toBeDefined();
        expect(results.directories[0].success).toBeUndefined();
    });

    test('it returns an error result for files when trying to delete files not in the directry', async() => {
        let filesToDelete = [{otype: 'file', id: fileInDir1.id}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(filesToDelete, dir2.id, project.id);
        expect(results.directories.length).toBe(0);
        expect(results.files.length).toBe(1);
        expect(results.files[0].error).toBeDefined();
    });

    test('it returns an error result they try to delete a directory that does not exist', async() => {
        let dirsToDelete = [{otype: 'directory', id: 'does-not-exist'}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(dirsToDelete, project.root_dir.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(1);
        expect(results.directories[0].error).toBeDefined();
    });

    test('it returns an error result they try to delete a file that does not exist', async() => {
        let filesToDelete = [{otype: 'file', id: 'does-not-exist'}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(filesToDelete, dir2.id, project.id);
        expect(results.directories.length).toBe(0);
        expect(results.files.length).toBe(1);
        expect(results.files[0].error).toBeDefined();
    });

    test('it returns an error when attempting to delete a directory that contains files', async() => {
        let dirsToDelete = [{otype: 'directory', id: dir1.id}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(dirsToDelete, project.root_dir.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(1);
        expect(results.directories[0].error).toBeDefined();
    });

    test('it returns an error when attempting to delete a directory that contains directories', async() => {
        let dir21 = await createDirsFromParent('dir2.1', dir2.id, project.id);
        dir21 = dir21[0];
        let dirsToDelete = [{otype: 'directory', id: dir21.id}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(dirsToDelete, project.root_dir.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(1);
        expect(results.directories[0].error).toBeDefined();
    });

    test('it successfully deletes a file in a directory', async() => {
        let filesToDelete = [{otype: 'file', id: fileInDir1.id}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(filesToDelete, dir1.id, project.id);
        expect(results.directories.length).toBe(0);
        expect(results.files.length).toBe(1);
        expect(results.files[0].success).toBeDefined();
    });

    test('it successfully deletes a directory that is empty', async() => {
        let createdDirsToDelete = await createDirsFromParent('dir3', project.root_dir.id, project.id);
        let dirsToDelete = [{otype: 'directory', id: createdDirsToDelete[0].id}];
        let results = await deleteDirsAndFilesInDirectoryFromProject(dirsToDelete, project.root_dir.id, project.id);
        expect(results.files.length).toBe(0);
        expect(results.directories.length).toBe(1);
        expect(results.directories[0].success).toBeDefined();
    });
});
