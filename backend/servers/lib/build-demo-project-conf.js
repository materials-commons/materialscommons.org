'use strict';
const demoProjectName = "Demo Project";
const demoProjectDescription = "A project for trying things out.";
const demoProjectExperimentName = "Demo: Microsegregation in HPDC L380";
const demoProjectExperimentDescription =
    "A demo experiment - A study of microsegregation in High Pressure Die Cast L380.";

const createSamplesTemplateId = 'global_Create Samples';
const sectioningTemplateId = 'global_Sectioning';
const ebsdTemplateId = 'global_EBSD SEM Data Collection';
const epmaTemplateId = 'global_EPMA Data Collection';

const processesData = [
    {
        name: 'Lift 380 Casting Day  # 1',
        templateId: createSamplesTemplateId,
        properties: [
            // Note: problem with date verification and retrival issue #998
            // {attribute: 'manufacturing_date', value: new Date('Feb 1, 2017')},           // February 1, 2017 == 1485977519347
            {attribute: "production_method", value: {name: "Cast", value: "cast"}},
            {attribute: 'manufacturer', value: 'Ohio State University'},
            {attribute: 'supplier', value: 'Ohio State University'}
        ],
        measurements: [
            {
                name: "Composition",
                attribute: "composition",
                otype: "composition",
                unit: "at%",
                value: [
                    {"element": "Al", "value": 94},
                    {"element": "Ca", "value": 1},
                    {"element": "Zr", "value": 5}],
                is_best_measure: true
            }
        ]
    },
    {
        name: 'Casting L124',
        templateId: sectioningTemplateId,
        properties: [],
        measurements: []
    },
    {
        name: 'Sectioning of Casting L124',
        templateId: sectioningTemplateId,
        properties: [],
        measurements: []
    },
    {
        name: 'EBSD SEM Data Collection - 5 mm plate',
        templateId: ebsdTemplateId,
        properties: [
            {attribute: 'voltage', value: 31, unit: 'kV'},
            {attribute: 'sample_tilt', value: 70},
            {attribute: 'scan_size_width', value: 2500},
            {attribute: 'scan_size_height', value: 2500},
            {attribute: 'step_size', value: 1},
            {attribute: 'working_distance', value: 20}
        ],
        measurements: []
    },
    {
        name: 'EPMA Data Collection - 5 mm plate - center',
        templateId: epmaTemplateId,
        properties: [
            {attribute: 'scan_type', value: {name: "Grid", value: "grid"}},
            {attribute: 'voltage', value: 15, unit: 'kV'},
            {attribute: 'beam_current', value: 20, unit: 'nA'},
            {attribute: 'step_size', value: 10},
            {attribute: 'grid_dimensions', value: '20 x 20'},
            {attribute: 'location', value: 'center, mid-thickness'}
        ],
        measurements: []
    }
];

const sampleNameData = [
    'l380', 'L124', 'L124 - 2mm plate', 'L124 - 3mm plate',
    'L124 - 5mm plate', 'L124 - 5mm plate - 3ST', 'L124 - tensil bar, gage'
];

const outputSampleIndexMap = [
    {processIndex: 0, sampleIndexList: [0]},
    {processIndex: 1, sampleIndexList: [1]},
    {processIndex: 2, sampleIndexList: [2, 3, 4, 5, 6]}
];

const inputSampleIndexMap = [
    {processIndex: 1, sampleIndexList: [0]},
    {processIndex: 2, sampleIndexList: [1]},
    {processIndex: 3, sampleIndexList: [4]},
    {processIndex: 4, sampleIndexList: [4]}
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

const datapathPrefix = 'backend/';
const datapath = 'scripts/demo-project/demo_project_data';
const fullDatapath = datapathPrefix + datapath;

const processFileIndexList = [
    [0,2,3], [0,1], [1], [4,5,6,7,8,9,10], [11,12,13,14,15]
];

module.exports = {
    demoProjectName,
    demoProjectDescription,
    demoProjectExperimentName,
    demoProjectExperimentDescription,
    createSamplesTemplateId,
    sectioningTemplateId,
    ebsdTemplateId,
    epmaTemplateId,
    processesData,
    sampleNameData,
    outputSampleIndexMap,
    inputSampleIndexMap,
    checksumsFilesAndMimiTypes,
    datapathPrefix,
    datapath,
    fullDatapath,
    processFileIndexList
};
