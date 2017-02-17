'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;
const fs = require('fs');
const child_process = require('child_process');
const execFile = require('child_process').execFile;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const apikeyCache = require(backend_base + '/servers/lib/apikey-cache')(dbModelUsers);

const base_user_id = 'thisIsAUserForTestingONLY!';
const fullname = "Test User";
const base_project_name = "Test project - test 1: ";
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
            let base_dir = process.env.MCDIR + "/project_demo/";
            let datapath = base_dir + "files";
            assert(fs.existsSync(datapath));
            for (var i = 0; i < filenames.length; i++) {
                let filename = filenames[i];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + filename);
            }
        });
    });
    describe('Run build demo script command with args',function() {
        it('Build demo project ', function* () {
            this.timeout(10000); // 10 seconds
            let apikey = user_apikey;
            let host = get_host_by_guessing();
            let base_dir = process.env.MCDIR + "/project_demo/";
            let datapath = base_dir + "files";

            let result = build_demo_project(host, apikey, datapath);
            console.log(result);

            let expected1 = 'Built project with name = Demo Project\n';
            let expected2 = "Refreshed project with name = Demo Project\n";
            assert(
                result == expected1 || result == expected2
            )
        })
    });
});

let build_demo_project = function(host, apikey, datapath) {
    console.log("$MCDIR = " + process.env.MCDIR);

    let base_dir = process.env.MCDIR + "/project_demo/";
    let source_dir = base_dir + "python";
    let host_part = " --host=" + host;
    let path_part = " --datapath=" + datapath;
    let key_part = " --apikey=" + apikey;
    let command1 = "cd " + source_dir;
    let command2 = "python build_project.py " + host_part + path_part + key_part;
    console.log("command1 = " + command1);
    console.log("command2 = " + command2);

    let command = command1 + " ; " + command2;

    const execSync = child_process.execSync;
    let results_buf = execSync(command);

    let result = results_buf.toString();
    return result;
};

let get_host_by_guessing = function(){
    let port = process.env.MCDB_PORT;
    let hostname = require('os').hostname();
    let apihost = "http://mctest.localhost/";
    if ((port === 30815) && (hostname == 'materialscommons.org')) {
        apihost = "https://test.materialscommons.org/"
    }
    else if ((port == 28015) && (hostname == 'materialscommons.org')) {
        apihost = 'https://materialscommons.org/'
    }
    else if (( port == 28015) && (hostname.contains('lift'))) {
        apihost = 'https://lift.materialscommons.org/'
    }
    console.log("demo-project api host = " + apihost);
    return apihost;
};
