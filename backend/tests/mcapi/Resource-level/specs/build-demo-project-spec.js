'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;
const fs = require('fs');
const os = require('os')
const exec = require('child_process').exec;
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));


const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const files = require(backend_base + '/servers/mcapi/db/model/files');
const users = require(backend_base + '/servers/mcapi/resources/users');
const fullname = "Test User";
const user_apikey = "ThisIsAJunkKey";
const user1Id = "mctest@mc.org";

const checksumsAndFiles = [
    ['6817cb556bdea4e2a2cd79f8a0de2880', 'LIFT Specimen Die.jpg'],
    ['c0e1b0a68cfbb42646e47ef31dd55eef', 'L124_photo.jpg'],
    ['59b628fb2ba9bcc47680205f444b5035', 'LIFT HPDC Samplesv3.xlsx'],
    ['38016d2624995af5999aa318f634f795', 'Measured Compositions_EzCast_Lift380.pptx'],
    ['25bd13db179fef53dafaa6346610d367', 'GSD_Results_L124_MC.xlsx'],
    ['e6980644196b03930f79b793879e5159', 'Grain_Size_EBSD_L380_comp_5mm.tiff'],
    ['3e73cdae8ad5f1bbef9875d7fec66e21', 'Grain_Size_EBSD_L380_comp_core.tiff'],
    ['4b4f34a5254da1513fa7f6a33775e402', 'Grain_Size_EBSD_L380_comp_skin.tiff'],
    ['0286b5cb1bb1b3f616d522c7b2ad4507', 'Grain_Size_Vs_Distance.tiff'],
    ['cbca60338ebbc1578aaa0419276d5dcf', 'L124_plate_5mm_TT_GF2.txt'],
    ['6873750df1be392232d7c18b55fe5d6e', 'L124_plate_5mm_TT_IPF.tif'],
    ['8ebabe85989a4bb8164174de57a637b9', 'EPMA_Analysis_L124_Al.tiff'],
    ['ff74dfe74be2ea7f825a421872b7483b', 'EPMA_Analysis_L124_Cu.tiff'],
    ['7d1bc051faa005244811f5272eea21f3', 'EPMA_Analysis_L124_Si.tiff'],
    ['f62635987157cfadac8035e0dc6bccfa', 'ExperimentData_Lift380_L124_20161227.docx'],
    ['d423248c056eff682f46181e0c912369', 'Samples_Lift380_L124_20161227.xlsx']
];


before(function*() {
    let user = yield dbModelUsers.getUser(user1Id);
    if (!user) {
        let results = yield r.db('materialscommons').table('users').insert({
            admin: false,
            affiliation: "",
            avatar: "",
            description: "",
            email: user1Id,
            apikey: user_apikey,
            fullname: fullname,
            homepage: "",
            id: user1Id,
            name: fullname,
            preferences: {
                tags: [],
                templates: []
            }
        });
        assert.equal(results.inserted, 1, "The User was correctly inserted");
    } else {
        assert.equal(user.id,user1Id, "Wrong test user, id = " + user.id);
    }
});

describe('Feature - User - Build Demo Project: ', function() {
    describe('User for test',function() {
        it('exists', function * (){
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user exists");
            assert.equal(user.apikey,user_apikey);
            assert.equal(user.id,user1Id);
            assert.equal(user.name,fullname);
        })
    });
    describe('List of files for build',function() {
        it('exists in folder', function *() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < checksumsAndFiles.length; i++) {
                let checksumAndFilename = checksumsAndFiles[i];
                let expectedChecksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + datapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
            }
        });
        it('is in the database', function*() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < checksumsAndFiles.length; i++) {
                let checksumAndFilename = checksumsAndFiles[i];
                let checksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let fileList = yield files.getAllByChecksum(checksum);
                if (fileList.length == 0) {
                    console.log("Missing demo file = " + filename + " in database. Run script!");
                }
                assert(fileList.length == 1, "Expecting exactly one file for checksum: " + checksum + "; " +
                    "got " + fileList.length);
                let file = yield files.get(fileList[0].id);
                assert(file.name == filename, "Filename for file by checksum for filename = " + filename +
                    "; with checksum = " + checksum + "; expected " + filename + " but found " + file.name);
            }
        });
    });

});

