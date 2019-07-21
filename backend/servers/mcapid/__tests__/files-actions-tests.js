const ActionHero = require('actionhero');
const actionhero = new ActionHero.Process();
const uuid = require('uuid/v4');
const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);

describe('uploadFileToProjectDirectory action tests', () => {
    let api;
    beforeAll(async () => api = await actionhero.start());
    afterAll(async () => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('moveFile action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('renameFileInProject action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getFileInProject action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('getFileByPathInProject action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});

describe('etl:getFileByPath action tests', () => {
    let api;
    beforeAll(async() => api = await actionhero.start());
    afterAll(async() => {
        await actionhero.stop();
    });

    test('It should ', () => {

    });
});