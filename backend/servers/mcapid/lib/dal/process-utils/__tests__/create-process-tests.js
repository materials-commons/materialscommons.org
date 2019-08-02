const r = require('@lib/test-utils/r');
const tutils = require('@lib/test-utils')(r);
const putil = require('@lib/dal/process-utils/create-process')(r);

describe('Test createProcess', () => {
    let proj;
    afterAll(async() => {
        await tutils.deleteProject(proj.id);
    });

    test('creates a project', async () => {
        proj = await tutils.createTestProject();
        let pid = await putil.createProcess(proj.id, 'test-process', 'test@test.mc');
        expect(pid).toBeTruthy();
    });
});