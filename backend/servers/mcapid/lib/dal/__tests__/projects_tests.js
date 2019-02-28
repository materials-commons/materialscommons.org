const r = require('@lib/r');
const projects = require('@dal/projects')(r);

describe('project actions', () => {
    let createdProject;
    let name;

    afterAll(async() => {
        await projects.deleteProject(createdProject.id);
    });

    test('a user can create a project', async() => {
        const user = {
            id: 'test@test.mc'
        };

        name = await r.uuid();
        createdProject = await projects.createProject(user, name, '');
        expect(createdProject).not.toBeNull();
        expect(createdProject.name).toEqual(name);
    });

    test('creating a project that already exists returns the existing project', async() => {
        const user = {
            id: 'test@test.mc'
        };

        let p = await projects.createProject(user, name, '');
        expect(p).not.toBeNull();
        expect(p.id).toEqual(createdProject.id);
    });
});