const r = require('@lib/r');
const files = require('@dal/files')(r);
const tutil = require('@lib/test-utils')(r);
const dirUtils = require('@dal/dir-utils')(r);

describe('Test moveFileToDirectory', () => {
    let project, dir1, fileInDir1;

    beforeAll(async() => {
        project = await tutil.createTestProject();
        [dir1, dir11] = await dirUtils.createDirsFromParent('dir1/dir11', project.root_dir.id, project.id);
        fileInDir1 = await tutil.createFile('file1.txt', dir1.id, project.id);
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should throw an error if file directory does not exist', async() => {
        await expect(files.moveFileToDirectory(fileInDir1.id, 'does-not-exist', dir11.id)).rejects.toThrow();
    });

    test('it should throw an error if file does not exist', async() => {
        await expect(files.moveFileToDirectory('does-not-exist', dir1.id, dir11.id)).rejects.toThrow();
    });

    test('it should move the file', async() => {
        let file = await files.moveFileToDirectory(fileInDir1.id, dir1.id, dir11.id);
        expect(file.directory.id).toBe(dir11.id);
    });
});