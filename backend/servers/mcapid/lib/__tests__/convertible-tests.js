const c = require('@lib/convertible');
const mcdir = require('@lib/mcdir');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fsExtra = require('fs-extra');
const path = require('path');

describe('Test isConvertibleFileType', () => {
    test('it should accept powerpoint files', () => {
        expect(c.isConvertibleFileType('application/vnd.ms-powerpoint')).toBeTruthy();
        expect(c.isConvertibleFileType('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBeTruthy();
    });

    test('it should accept word files', () => {
        expect(c.isConvertibleFileType('application/msword')).toBeTruthy();
        expect(c.isConvertibleFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBeTruthy();

    });

    test('it should accept excel files', () => {
        expect(c.isConvertibleFileType('application/vnd.ms-excel')).toBeTruthy();
        expect(c.isConvertibleFileType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBeTruthy();

    });

    test('it should accept tiff files', () => {
        expect(c.isConvertibleFileType('image/tiff')).toBeTruthy();

    });

    test('it should accept bmp files', () => {
        expect(c.isConvertibleFileType('image/bmp')).toBeTruthy();
        expect(c.isConvertibleFileType('image/x-ms-bmp')).toBeTruthy();

    });

    test('it should reject files not in the above types', () => {
        expect(c.isConvertibleFileType('text/plain')).toBeFalsy();
    });
});

describe('Test convertFile', () => {
    const docFile = {
        id: '15f43a89-7d25-4cc2-a4db-54dc158ffd62',
        mediatype: {
            mime: 'application/msword'
        }
    };

    const tiffFile = {
        id: '23f43a89-7d25-4cc2-a4db-54dc158ffd62',
        mediatype: {
            mime: 'image/tiff'
        }
    };

    beforeAll(() => {
        mcdir.setMCDirs(os.tmpdir());
    });

    afterAll(() => {
        // Set mcdirs to zero length array to restore behavior of
        // looking at the environment variable MCDIR.
        mcdir.setMCDirs([]);
    });

    test('it should properly form the libreoffice command', () => {
        let expectedCommand = 'libreoffice  -env:UserInstallation=file:///tmp/15f43a89-7d25-4cc2-a4db-54dc158ffd62 --headless  --convert-to pdf  --outdir /tmp  /tmp/7d/25/15f43a89-7d25-4cc2-a4db-54dc158ffd62; cp /tmp/15f43a89-7d25-4cc2-a4db-54dc158ffd62.pdf /tmp/7d/25/.conversion;  rm /tmp/15f43a89-7d25-4cc2-a4db-54dc158ffd62.pdf';
        expect(c.convertDocumentCommand(docFile)).toBe(expectedCommand);
    });

    test('it should properly form the convert image command', () => {
        let expectedCommand = 'convert /tmp/7d/25/23f43a89-7d25-4cc2-a4db-54dc158ffd62 /tmp/7d/25/.conversion/23f43a89-7d25-4cc2-a4db-54dc158ffd62.jpg';
        expect(c.convertImageCommand(tiffFile)).toBe(expectedCommand);
    });

    test('it should convert tiff image', async() => {
        // Setup mcdir structure by creating the directories where the file
        // should exist in mcdir.
        await fsExtra.ensureDir(mcdir.fileDir(tiffFile.id));
        await exec(`cp ${__dirname}/data/small.tiff ${path.join(mcdir.fileDir(tiffFile.id), tiffFile.id)}`);

        // Perform conversion and check that the converted file was created
        let didConvert = await c.convertFile(tiffFile);
        expect(didConvert).toBeTruthy();
        let exists = await fsExtra.pathExists(path.join(mcdir.conversionDir(tiffFile.id), tiffFile.id + '.jpg'));
        expect(exists).toBeTruthy();

        // Remove the directory where the converted file is and remove the original file
        // ie:
        // /tmp/7d/25/23f43a89-7d25-4cc2-a4db-54dc158ffd62
        // /tmp/7d
        //
        // console.log('rm file ', path.join(mcdir.fileDir(tiffFile.id), tiffFile.id));
        // console.log('rm -rf dir ', path.dirname(mcdir.fileDir(tiffFile.id)));

        await fsExtra.remove(path.join(mcdir.fileDir(tiffFile.id), tiffFile.id));
        await fsExtra.remove(path.dirname(mcdir.pathToFileId(tiffFile.id)));
    });

    test('it should convert word doc', async() => {
        // Setup mcdir structure by creating the directories where the file
        // should exist in mcdir.
        await fsExtra.ensureDir(mcdir.fileDir(docFile.id));
        await exec(`cp ${__dirname}/data/small.docx ${path.join(mcdir.fileDir(docFile.id), docFile.id)}`);

        // Perform conversion and check that the converted file was created
        let didConvert = await c.convertFile(docFile);
        expect(didConvert).toBeTruthy();
        let exists = await fsExtra.pathExists(path.join(mcdir.conversionDir(docFile.id), docFile.id + '.pdf'));
        expect(exists).toBeTruthy();

        // Remove the directory where the converted file is and remove the original file
        // ie:
        // /tmp/7d/25/15f43a89-7d25-4cc2-a4db-54dc158ffd62
        // /tmp/7d
        //
        // console.log('rm file ', path.join(mcdir.fileDir(docFile.id), docFile.id));
        // console.log('rm -rf dir ', path.dirname(mcdir.fileDir(docFile.id)));

        await fsExtra.remove(path.join(mcdir.fileDir(docFile.id), docFile.id));
        await fsExtra.remove(path.dirname(mcdir.pathToFileId(docFile.id)));
    });
});