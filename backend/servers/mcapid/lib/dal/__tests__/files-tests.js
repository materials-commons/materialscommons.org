const r = require('@lib/test-utils/r');
const files = require('@dal/files')(r);
const tutil = require('@lib/test-utils')(r);
const dirUtils = require('@dal/dir-utils')(r);

describe('Test moveFileToDirectory', () => {
    let project, dir1, dir11, file1, file1Child;

    beforeAll(async() => {
        project = await tutil.createTestProject();
        [dir1, dir11] = await dirUtils.createDirsFromParent('dir1/dir11', project.root_dir.id, project.id);
        file1 = await tutil.createFile('file1.txt', dir1.id, project.id);
        file1Child = await tutil.createFile('file1.txt', dir1.id, project.id);
        await r.table('datafiles').get(file1Child.id).update({parent: file1.id});
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should throw an error if file directory does not exist', async() => {
        await expect(files.moveFileToDirectory(file1.id, 'does-not-exist', dir11.id)).rejects.toThrow();
    });

    test('it should throw an error if file does not exist', async() => {
        await expect(files.moveFileToDirectory('does-not-exist', dir1.id, dir11.id)).rejects.toThrow();
    });

    test('it should move the file and all versions', async() => {
        let file = await files.moveFileToDirectory(file1.id, dir1.id, dir11.id);
        expect(file.directory.id).toBe(dir11.id);
        let file1dir = await r.table('datadir2datafile').getAll(file1.id, {index: 'datafile_id'}).nth(0);
        let file1Childdir = await r.table('datadir2datafile').getAll(file1Child.id, {index: 'datafile_id'}).nth(0);
        expect(file1dir.datadir_id).toBe(dir11.id);
        expect(file1Childdir.datadir_id).toBe(dir11.id);
    });
});

describe('Test renameFile', () => {
    let project, file1, file1Child;

    beforeAll(async() => {
        project = await tutil.createTestProject();
        [dir1, dir11] = await dirUtils.createDirsFromParent('dir1/dir11', project.root_dir.id, project.id);
        file1 = await tutil.createFile('file1.txt', dir1.id, project.id);
        file1Child = await tutil.createFile('file1.txt', dir1.id, project.id);
        await r.table('datafiles').get(file1Child.id).update({parent: file1.id});
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should rename the file and its different versions', async() => {
        let status = await files.renameFile(file1.id, 'file1-renamed.txt');
        expect(status).toBeTruthy();
        let f1 = await r.table('datafiles').get(file1.id);
        let f1Child = await r.table('datafiles').get(file1Child.id);
        expect(f1.name).toBe('file1-renamed.txt');
        expect(f1Child.name).toBe('file1-renamed.txt');
    });
});
