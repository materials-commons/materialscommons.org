const r = require('@lib/r');
const {createDirsFromParent} = require('@dal/dir-utils')(r);
const projects = require('@dal/projects')(r);

describe('test createDirsFromParent', () => {
    let project;
    beforeAll(async() => {
        const user = {id: 'test@test.mc'};
        let name = await r.uuid();
        project = await projects.createProject(user, name, '');
    });

    afterAll(async() => {
        await projects.deleteProject(project.id);
    });

    test('it throws an exception if parent directory does not exist', async() => {
        await expect(createDirsFromParent('dir1', 'bad-parent-dir-id', project.id)).rejects.toThrow();
    });

    test('it throws an exception if project does not exist', async() => {
        await expect(createDirsFromParent('dir1', project.root_dir.id, 'bad-project-id')).rejects.toThrow();
    });

    test('it can create a single directory', async() => {
        let dirs = await createDirsFromParent('dir1', project.root_dir.id, project.id);
        expect(dirs.length).toBe(1);
    });

    test('it can create multiple directories from a/path/of/dirs', async() => {
        let dirs = await createDirsFromParent('dir2/dir2.1', project.root_dir.id, project.id);
        expect(dirs.length).toBe(2);
    });
});