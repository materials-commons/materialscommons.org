const ActionHero = require('actionhero');
const actionhero = new ActionHero.Process();
const uuid = require('uuid/v4');
const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);

describe('createProject action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should create a project', async () => {
        let projName = uuid();
        let params = {
            name: projName,
            apikey: 'totally-bogus',
        };
        let result = await api.specHelper.runAction('createProject', params);
        expect(result.data.name).toEqual(projName);
        await tutil.deleteProject(result.data.id);
    });

    test('It should return an already existing project when creating a project that already exists', async () => {
        let projName = uuid();
        let params = {
            name: projName,
            apikey: 'totally-bogus',
        };
        let result = await api.specHelper.runAction('createProject', params);
        expect(result.data.name).toEqual(projName);

        let result2 = await api.specHelper.runAction('createProject', params);
        expect(result2.data.name).toEqual(projName);
        expect(result2.data.id).toEqual(result.data.id);
    });

    test('It should fail to create a project with an empty name', async () => {
        let params = {
            name: '',
            apikey: 'totally-bogus',
        };

        let result = await api.specHelper.runAction('createProject', params);
        expect(result.error).toBeTruthy();
    });
});

// describe(' action tests', () => {
//     beforeAll(async () => api = await actionhero.start());
//     afterAll(async () => await actionhero.stop());
//
//     test('It should ', () => {
//
//     });
// });
//
// describe(' action tests', () => {
//     beforeAll(async () => api = await actionhero.start());
//     afterAll(async () => await actionhero.stop());
//
//     test('It should ', () => {
//
//     });
// });
//
// describe(' action tests', () => {
//     beforeAll(async () => api = await actionhero.start());
//     afterAll(async () => await actionhero.stop());
//
//     test('It should ', () => {
//
//     });
// });
//
// describe(' action tests', () => {
//     beforeAll(async () => api = await actionhero.start());
//     afterAll(async () => await actionhero.stop());
//
//     test('It should ', () => {
//
//     });
// });