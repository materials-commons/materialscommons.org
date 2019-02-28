const r = require('@lib/r');
const projects = require('@dal/projects')(r);

describe('project actions', () => {
    let createdProject;
    afterAll(async() => {
        await projects.deleteProject(createdProject.id);
    });
    test('a user can create a project', async() => {
        const user = {
            id: 'test@test.mc'
        };

        createdProject = await projects.createProject(user, 'proj1', '');
        expect(createdProject).not.toBeNull();
        expect(createdProject.name).toEqual('proj1');
    });

    test('creating a project that already exists returns the existing project', async() => {
        const user = {
            id: 'test@test.mc'
        };

        let p = await projects.createProject(user, 'proj1', '');
        expect(p).not.toBeNull();
        expect(p.id).toEqual(createdProject.id);
    });
});