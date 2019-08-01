const ActionHero = require('actionhero');
const actionhero = new ActionHero.Process();
const uuid = require('uuid/v4');
const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);

describe(' action tests', () => {
    let api, proj;
    beforeAll(async() => {
        api = await actionhero.start();
        proj = await tutil.createTestProject();
    });
    afterAll(async() => {
        await actionhero.stop();
        await tutil.deleteProject(proj.id);
    });

    test('It should validate correctly', async() => {
        console.log('I am here');
        let params = {
            project_id: proj.id,
            process_id: 'does-not-exist',
            files: ['does-not-exist'],
            apikey: 'totally-bogus'
        };

        let result = await api.specHelper.runAction('removeFilesFromProcess', params);
        console.log('result', result);
    });
});