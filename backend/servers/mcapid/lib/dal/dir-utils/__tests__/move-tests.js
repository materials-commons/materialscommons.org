const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);
const dirUtils = require('@dal/dir-utils')(r);
const path = require('path');

describe('Test moveDir', () => {
    let project, dir1, dir2;

    beforeAll(async() => {
        project = await tutil.createTestProject();
        [dir1] = await dirUtils.createDirsFromParent('dir1', project.root_dir.id, project.id);
        [dir2] = await dirUtils.createDirsFromParent('dir2', project.root_dir.id, project.id);
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should move a single level directory', async() => {
        await dirUtils.moveDir(dir1.id, dir2.id);
        let moved = await r.table('datadirs').get(dir1.id);
        expect(moved.name).toBe(path.join(project.name, 'dir2', 'dir1'));
        expect(moved.parent).toBe(dir2.id);
    });

    test('it should move a directory and all its children', async() => {
        let [dir3] = await dirUtils.createDirsFromParent('dir3', project.root_dir.id, project.id);
        let [dir31] = await dirUtils.createDirsFromParent('dir31', dir3.id, project.id);

        await dirUtils.moveDir(dir3.id, dir2.id);
        dir3 = await r.table('datadirs').get(dir3.id);
        expect(dir3.name).toBe(path.join(project.name, 'dir2', 'dir3'));
        expect(dir3.parent).toBe(dir2.id);

        dir31 = await r.table('datadirs').get(dir31.id);
        expect(dir31.name).toBe(path.join(project.name, 'dir2', 'dir3', 'dir31'));
        expect(dir31.parent).toBe(dir3.id);
    });
});

describe('Test renameDir', () => {
    let project;

    beforeAll(async() => {
        project = await tutil.createTestProject();
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should rename a directory', async() => {
        let [dir1] = await dirUtils.createDirsFromParent('dir1', project.root_dir.id, project.id);
        let originalParent = dir1.parent;
        await dirUtils.renameDir(dir1.id, 'dir1renamed');
        dir1 = await r.table('datadirs').get(dir1.id);
        expect(dir1.name).toBe(path.join(project.name, 'dir1renamed'));
        expect(dir1.parent).toBe(originalParent);
    });

    test('it should rename a directory and all its children', async() => {
        let [dir2, dir21] = await dirUtils.createDirsFromParent('dir2/dir21', project.root_dir.id, project.id);
        await dirUtils.renameDir(dir2.id, 'dir2renamed');

        let renamedDir2 = await r.table('datadirs').get(dir2.id);
        expect(renamedDir2.name).toBe(path.join(project.name, 'dir2renamed'));
        expect(renamedDir2.parent).toBe(dir2.parent);

        let renamedDir21 = await r.table('datadirs').get(dir21.id);
        expect(renamedDir21.name).toBe(path.join(project.name, 'dir2renamed', 'dir21'));
        expect(renamedDir21.parent).toBe(dir21.parent);
    });
});
