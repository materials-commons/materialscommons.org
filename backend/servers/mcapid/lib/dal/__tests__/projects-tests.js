const r = require('@lib/test-utils/r');
const projects = require('@dal/projects')(r);

describe('Test createProject', () => {
    let createdProject;
    let name;

    afterAll(async() => {
        await projects.deleteProject(createdProject.id);
    });

    test('a user can create a project', async() => {
        name = await r.uuid();
        createdProject = await projects.createProject('test@test.mc', name, '');
        expect(createdProject).not.toBeNull();
        expect(createdProject.name).toEqual(name);
    });

    test('creating a project that already exists returns the existing project', async() => {
        let p = await projects.createProject('test@test.mc', name, '');
        expect(p).not.toBeNull();
        expect(p.id).toEqual(createdProject.id);
    });
});
