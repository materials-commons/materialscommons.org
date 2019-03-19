const r = require('@lib/test-utils/r');
const {createDirsFromParent} = require('@dal/dir-utils')(r);
const projects = require('@dal/projects')(r);
const path = require('path');

describe('test createDirsFromParent', () => {
    let project;
    beforeAll(async() => {
        let name = await r.uuid();
        project = await projects.createProject('test@test.mc', name, '');
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
        expect(dirs[0].parent).toBe(project.root_dir.id);
        expect(dirs[0].name).toBe(path.join(project.name, 'dir1'));
    });

    test('it can create multiple directories from a/path/of/dirs', async() => {
        let dirs = await createDirsFromParent('dir2/dir2.1', project.root_dir.id, project.id);
        expect(dirs.length).toBe(2);

        let [dir2, dir21] = dirs;
        expect(dir21.parent).toBe(dir2.id);
        expect(dir2.parent).toBe(project.root_dir.id);

        expect(dir2.name).toBe(path.join(project.name, 'dir2'));
        expect(dir21.name).toBe(path.join(project.name, 'dir2', 'dir2.1'));
    });
});
