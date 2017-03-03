const fs = require('fs');
const os = require('os')
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const backend_base = '../..';
const dbModelProjects = require(backend_base + '/servers/mcapi/db/model/projects');
const dbModelExperiments = require(backend_base + '/servers/mcapi/db/model/experiments');
const dbModelProcesses = require(backend_base + '/servers/mcapi/db/model/processes');
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const dbModelDirectories = require(backend_base + '/servers/mcapi/db/model/directories');
const dbModelFiles = require(backend_base + '/servers/mcapi/db/model/files');
const resourceUsers = require(backend_base + '/servers/mcapi/resources/users');
const fileUtils = require(backend_base + '/servers/lib/create-file-utils');


const demoProjectName = "Demo Project";
const demoProjectDescription = "A project for trying things out.";
const demoProjectExperimentName = "Demo: Microsegregation in HPDC L380";
const dmeoProjectExperimentDescription =
    "A demo experiment - A study of microsegregation in High Pressure Die Cast L380.";

const createSamplesTemplateId = 'global_Create Samples';
const sectioningTemplateId = 'global_Sectioning';
const ebsdTemplateId = 'global_EBSD SEM Data Collection';
const epmaTemplateId = 'global_EPMA Data Collection';

const processesData = [
    {
        'name': 'Lift 380 Casting Day  # 1',
        'templateId': createSamplesTemplateId
    },
    {
        'name': 'Casting L124',
        'templateId': sectioningTemplateId
    },
    {
        'name': 'Sectioning of Casting L124',
        'templateId': sectioningTemplateId
    },
    {
        'name': 'EBSD SEM Data Collection - 5 mm plate',
        'templateId': ebsdTemplateId
    },
    {
        'name': 'EPMA Data Collection - 5 mm plate - center',
        'templateId': epmaTemplateId
    }
];

const tiffMimeType = "image/tiff";
const jpegMimeType = "image/jpeg";
const textMimeTYpe = "text/plain";
const ppxtMimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
const xlsxMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const xdocMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const checksumsFilesAndMimiTypes = [
    ['6817cb556bdea4e2a2cd79f8a0de2880', 'LIFT Specimen Die.jpg', jpegMimeType],
    ['c0e1b0a68cfbb42646e47ef31dd55eef', 'L124_photo.jpg', jpegMimeType],
    ['59b628fb2ba9bcc47680205f444b5035', 'LIFT HPDC Samplesv3.xlsx', xlsxMimeType],
    ['38016d2624995af5999aa318f634f795', 'Measured Compositions_EzCast_Lift380.pptx', ppxtMimeType],
    ['25bd13db179fef53dafaa6346610d367', 'GSD_Results_L124_MC.xlsx', xlsxMimeType],
    ['e6980644196b03930f79b793879e5159', 'Grain_Size_EBSD_L380_comp_5mm.tiff', tiffMimeType],
    ['3e73cdae8ad5f1bbef9875d7fec66e21', 'Grain_Size_EBSD_L380_comp_core.tiff', tiffMimeType],
    ['4b4f34a5254da1513fa7f6a33775e402', 'Grain_Size_EBSD_L380_comp_skin.tiff', tiffMimeType],
    ['0286b5cb1bb1b3f616d522c7b2ad4507', 'Grain_Size_Vs_Distance.tiff', tiffMimeType],
    ['cbca60338ebbc1578aaa0419276d5dcf', 'L124_plate_5mm_TT_GF2.txt', textMimeTYpe],
    ['6873750df1be392232d7c18b55fe5d6e', 'L124_plate_5mm_TT_IPF.tif', tiffMimeType],
    ['8ebabe85989a4bb8164174de57a637b9', 'EPMA_Analysis_L124_Al.tiff', tiffMimeType],
    ['ff74dfe74be2ea7f825a421872b7483b', 'EPMA_Analysis_L124_Cu.tiff', tiffMimeType],
    ['7d1bc051faa005244811f5272eea21f3', 'EPMA_Analysis_L124_Si.tiff', tiffMimeType],
    ['f62635987157cfadac8035e0dc6bccfa', 'ExperimentData_Lift380_L124_20161227.docx', xdocMimeType],
    ['d423248c056eff682f46181e0c912369', 'Samples_Lift380_L124_20161227.xlsx', xlsxMimeType]
];

const datapath = 'backend/scripts/demo-project/demo_project_data';

function* createOrFindDemoProjectForUser(user) {
    // Note create project returns the project if it already exists, by name
    // It does not create a duplicate!
    let attributes = {
        name: demoProjectName,
        description: demoProjectDescription
    }
    // ret == val.ok_val or error.error
    return yield dbModelProjects.createProject(user,attributes);
}

function* createOrFindDemoProjectExperiment(project) {
    let experimentName = demoProjectExperimentName;
    let experimentDescription = dmeoProjectExperimentDescription;
    let ret = yield dbModelExperiments.getAllForProject(project.id);
    if (ret.val) {
        let experiment = null;
        let experiments = ret.val;
        experiments.forEach((e) => {
            if (e.name == experimentName) {
                experiment = e;
            }
        });
        if (experiment) {
            ret = { val: experiment }
        } else {
            let args = {
                project_id: project.id,
                name: experimentName,
                description: experimentDescription
            };
            ret = yield dbModelExperiments.create(args,project.owner);
        }
    }
    // ret == val.ok_val or error.error
    return ret;
}

function* createOrFindDemoProcess(project,experiment,processName,templateId) {
    let simple = true;
    let ret = yield dbModelExperiments.getProcessesForExperiment(experiment.id, simple);
    if (! ret.error) {
        let processes = ret.val;
        let nameMatchProcess = null;
        processes.forEach((process) => {
            if (process.name == processName) {
                nameMatchProcess = process;
            }
        });
        if (! nameMatchProcess) {
            ret = yield dbModelExperiments.addProcessFromTemplate(project.id, experiment.id,templateId, project.owner);
            if (! ret.error) {
                let process = ret.val;
                let args = {name: processName, files:[], properties:[], samples:[]};
                ret = yield dbModelProcesses.updateProcess(process.id,args);
            }
        } else {
            ret.val = nameMatchProcess;
        }
    }
    // ret == val.ok_val or error.error
    return ret;
}

function* createOrFindAllDemoProcesses(project,experiment) {
    let ret = {error: "unknown error in createOrFindAllDemoProcesses"};
    let processes = [];

    for (let i = 0; i < processesData.length; i++) {
        let processData = processesData[i];
        let processName = processData.name;
        let templateId = processData.templateId;

        ret = yield createOrFindDemoProcess(project,experiment,processName,templateId);
        if (ret.error) {
            break;
        }
        let process = ret.val;
        processes.push(process);
    }

    if (! ret.error) {
        ret.val = processes;
    }

    // ret == val.ok_val or error.error
    return ret;
}

function* createOrFindOutputSamplesFromProcess(process,sampleNameList) {
    // ret == val.ok_val or error.error
    return {
        error: "not implemented yet"
    }
}

function filesDescriptions(){
    return checksumsFilesAndMimiTypes;
}

function* filesMissingInFolder() {
    let ret = [];
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumAndFilename = filesDescriptions()[i];
        let expectedChecksum = checksumAndFilename[0];
        let filename = checksumAndFilename[1];
        let path = `${datapath}/${filename}`;
        let ok = false;
        if (fs.existsSync(path)) {
            let checksum = yield md5File(path);
            if (checksum == expectedChecksum) {
                ok = true;
            }
        }
        if (!ok) {
            ret.push(filename);
        }
    }
    return ret;
}

function* filesMissingInDatabase(project){
    let files = yield filesForProject(project);
    let table = {}
    files.forEach((file) => {
        table[file.checksum] = file;
    });

    let ret = [];
    filesDescriptions().forEach((fileDescription) => {
        let expectedChecksum = fileDescription[0];
        let filename = fileDescription[1];
        let ok = table[expectedChecksum];
        if (!ok) {
            ret.push(filename);
        }
    });
    return ret;
}

function* addAllFiles(user,project) {
    let top_directory =  yield dbModelDirectories.get(project.id,'top');
    let tempDir = os.tmpdir();
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumFilenameAndMimetype = filesDescriptions()[i];
        let expectedChecksum = checksumFilenameAndMimetype[0];
        let filename = checksumFilenameAndMimetype[1];
        let mimetype = checksumFilenameAndMimetype[2];
        let path = `${datapath}/${filename}`;
        let checksum = yield md5File(path);
        if (expectedChecksum == checksum) {
            let stats = fs.statSync(path);
            let fileSizeInBytes = stats.size;
            let source = yield copyOne(path,tempDir);
            path = source.path;
            let args = {
                name: filename,
                checksum: checksum,
                mediatype: fileUtils.mediaTypeDescriptionsFromMime(mimetype),
                filesize: fileSizeInBytes,
                filepath: path
            };
            let file = yield dbModelDirectories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
        }
    }
}

function* filesForProject(project) {
    let top_directory =  yield dbModelDirectories.get(project.id,'top');
    let children = top_directory.children;
    let files = []
    for (let i = 0; i < children.length; i++) {
        let fileOrDir = children[i];
        if (fileOrDir.otype == 'file') files.push(fileOrDir);
    }
    return files;
}

function* makeTemplateTable() {
    let ret = yield dbModelProcesses.getProcessTemplates();
    let table = {};
    if (ret.val) {
        let templates = ret.val;
        templates.forEach((template) => {
            table[template.id] = template;
        });
    }
    return table;
}

module.exports = {
    createOrFindDemoProjectForUser,
    createOrFindDemoProjectExperiment,
    createOrFindDemoProcess,
    createOrFindAllDemoProcesses,
    filesDescriptions,
    filesMissingInFolder,
    filesMissingInDatabase,
    addAllFiles,
    filesForProject,
    makeTemplateTable
};