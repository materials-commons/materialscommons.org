const ActionHero = require('actionhero');
const actionhero = new ActionHero.Process();
const uuid = require('uuid/v4');
const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);

describe('listDatasets action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDataset action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDatasetFiles action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDatasetSamplesAndProcesses action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('createDataset action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should create a dataset', async () => {
        let proj = await tutil.createTestProject();
        let title = uuid();
        let params = {
            title: title,
            project_id: proj.id,
            apikey: 'totally-bogus',
        };
        let result = await api.specHelper.runAction('createDataset', params);
        expect(result.error).toBeFalsy();
        expect(result.data.title).toEqual(title);

        let params2 = {project_id: proj.id, dataset_id: result.data.id, apikey: 'totally-bogus'};
        result = await api.specHelper.runAction('deleteDataset', params2);
        expect(result.error).toBeFalsy();

        await tutil.deleteProject(proj.id);
    });
});

describe('deleteDataset action tests', () => {
    let api;

    beforeAll(async () => {
        api = await actionhero.start();
    });

    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('updateDatasetFileSelection action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('addDatasetFiles action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('addDatasetSamples action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('deleteDatasetSamples action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('deleteProcessesFromDatasetSample action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('publishDataset action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('publishPrivateDataset action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('unpublishDataset action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});