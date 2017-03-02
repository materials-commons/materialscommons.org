'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;
const fs = require('fs');
const os = require('os')
const exec = require('child_process').exec;


const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const users = require(backend_base + '/servers/mcapi/resources/users');
const fullname = "Test User";
const user_apikey = "ThisIsAJunkKey";
const user1Id = "mctest@mc.org";

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
    describe('Datafile directory for test',function() {
        it('exists', function *() {
            let filenames = [
                'LIFT Specimen Die.jpg',
                'L124_photo.jpg',
                'LIFT HPDC Samplesv3.xlsx',
                'Measured Compositions_EzCast_Lift380.pptx',
                'GSD_Results_L124_MC.xlsx',
                'Grain_Size_EBSD_L380_comp_5mm.tiff',
                'Grain_Size_EBSD_L380_comp_core.tiff',
                'Grain_Size_EBSD_L380_comp_skin.tiff',
                'Grain_Size_Vs_Distance.tiff',
                'L124_plate_5mm_TT_GF2.txt',
                'L124_plate_5mm_TT_IPF.tif',
                'EPMA_Analysis_L124_Al.tiff',
                'EPMA_Analysis_L124_Cu.tiff',
                'EPMA_Analysis_L124_Si.tiff',
                'ExperimentData_Lift380_L124_20161227.docx',
                'Samples_Lift380_L124_20161227.xlsx'
            ];
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (var i = 0; i < filenames.length; i++) {
                let filename = filenames[i];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + filename);
            }
        });
    });
    describe('Run with bad url throws exception',function() {
        it('Builds a demo project', function* () {
            this.timeout(30000); // 30 seconds
            let port = process.env.MCDB_PORT,
                hostname = os.hostname(),
                apihost = '',
                source_dir = 'backend/scripts/demo-project',
                datapath = 'backend/scripts/demo-project/demo_project_data',
                apikey = user_apikey
                apihost = "http://noda.host";

            let command = `${source_dir}/build_project.py --host ${apihost} --apikey ${apikey} --datapath ${datapath}`;
            let error = null;
            try{
                let result = yield promiseExec(command);
                console.log("              ", result);
            } catch (e) {
                error = e;
            }
            assert.isNotNull(error);
            assert(error instanceof Error);
        })
    });
});
