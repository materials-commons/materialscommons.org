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

    test('It should ', () => {

    });
});

describe('deleteDataset action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

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
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});