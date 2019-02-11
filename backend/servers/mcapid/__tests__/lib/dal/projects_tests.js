const projects = require('../../../lib/dal/projects');

describe('project actions', () => {
    let createdProject;
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