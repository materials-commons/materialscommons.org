const ActionHero = require('actionhero');
const actionhero = new ActionHero.Process();
const uuid = require('uuid/v4');
const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);

describe('listDatasets action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDatasetFiles action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getDatasetSamplesAndProcesses action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('createDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should create a dataset', async() => {
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
    let api, ds, proj;

    beforeAll(async() => {
        api = await actionhero.start();
        proj = await tutil.createTestProject();
        let title = uuid();
        let params = {
            title: title,
            project_id: proj.id,
            apikey: 'totally-bogus',
        };
        let result = await api.specHelper.runAction('createDataset', params);
        expect(result.error).toBeFalsy();
        ds = result.data;
    });

    afterAll(async() => {
        await actionhero.stop();
        await tutil.deleteProject(proj.id);
    });

    test('It should return an error when dataset is published', async() => {
        await r.table('datasets').get(ds.id).update({published: true});
        let params = {project_id: proj.id, dataset_id: ds.id, apikey: 'totally-bogus'};
        let result = await api.specHelper.runAction('deleteDataset', params);
        expect(result.error).toBeTruthy();
        await r.table('datasets').get(ds.id).update({published: false});
    });

    test('It should return an error when dataset is privately published', async() => {
        await r.table('datasets').get(ds.id).update({is_published_private: true});
        let params = {project_id: proj.id, dataset_id: ds.id, apikey: 'totally-bogus'};
        let result = await api.specHelper.runAction('deleteDataset', params);
        expect(result.error).toBeTruthy();
        await r.table('datasets').get(ds.id).update({is_published_private: false});
    });

    test('It should delete a dataset that is not published', async() => {
        let params = {project_id: proj.id, dataset_id: ds.id, apikey: 'totally-bogus'};
        let result = await api.specHelper.runAction('deleteDataset', params);
        expect(result.error).toBeFalsy();
    });
});

describe('updateDatasetFileSelection action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('addDatasetFiles action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('addDatasetSamples action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('deleteDatasetSamples action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('deleteProcessesFromDatasetSample action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('publishDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('publishPrivateDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('unpublishDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});