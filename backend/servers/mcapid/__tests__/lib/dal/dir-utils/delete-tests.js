const r = require('../../../../../shared/r');
const {deleteDirsAndFilesInDirectoryFromProject} = require('../../../../lib/dal/dir-utils')(r);

describe('Test deleting files and directories', () => {

    test('a user can delete a file that they own', async() => {

    });

    test('a user cannot delete a file they do not have access to', async() => {

    });

    test('a user cannot delete a file that does not exist', async() => {

    });

    test('a user can delete an empty directory', async() => {

    });

    test('a user gets an error when they try to delete a directory that does not exist', async() => {

    });

    test('a user cannot delete a directory that contains files', async() => {
    });

    test('a user cannot delete a directory that contains directories', async() => {

    });
});
