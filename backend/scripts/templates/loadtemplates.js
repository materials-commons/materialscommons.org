#!/usr/bin/env node

function nameToAttr(name) {
    return name.replace(/\s+/g, '_').replace(/\//g, '_').toLowerCase()
}

function createNumber(name, units) {
    return {
        name: name,
        attribute: nameToAttr(name),
        required: false,
        units: units.length === 0 || units.length === 1 ? [] : units,
        unit: units.length ? units[0] : "",
        value: "",
        otype: "number",
        description: "",
        choices: []
    }
}

function createSelection(name, choices) {
    return {
        name: name,
        attribute: nameToAttr(name),
        description: "",
        value: "",
        units: [],
        unit: "",
        otype: "selection",
        required: false,
        choices: choices
    }
}

function createString(name) {
    return {
        name: name,
        attribute: attrToName(name),
        description: "",
        value: "",
        units: [],
        unit: "",
        otype: "string",
        required: false,
        choices: []
    }
}

function createDate(name) {
    return {
        name: name,
        attribute: attrToName(name),
        description: "",
        value: "",
        units: [],
        unit: "",
        otype: "date",
        required: false,
        choices: []
    }
}

const UNITS_TEMPERATURE = ["K", "F", "C"];
function createTemperature(name) {
    return createNumber(name ? name : "Temperature", UNITS_TEMPERATURE)
}

const UNITS_VOLTAGE = ["kV", "V"];
function createVoltage(name) {
    return createNumber(name ? name : "Voltage", UNITS_VOLTAGE);
}

const UNITS_CURRENT = ["A", "mA", "nA"];
function createCurrent(name) {
    return createNumber(name ? name : "Current", UNITS_CURRENT);
}

const UNITS_TIME = ["h", "m", "s"];
function createTime(name) {
    return createNumber(name ? name : "Time", UNITS_TIME);
}

const UNITS_STIME = ["s", "ms"];
function createSmallTime(name) {
    return createNumber(name ? name : "Time", UNITS_STIME);
}

const UNITS_STRAIN = ["mm/mm", "percentage"];
function createStrain(name) {
    return createNumber(name ? name : "Strain", UNITS_STRAIN);
}

class TemplateBase {
    constructor(name, processType, doesTransform, destructive) {
        this.name = name;
        this.process_name = name;
        this.process_type = processType;
        this.description = name;
        this.category = "";
        this.does_transform = doesTransform;
        this.destructive = destructive;
        this.measurements = [];
        this.setup = [];
    }
}

class AptTemplate extends TemplateBase {
    constructor() {
        super("APT", "measurement", false, false);
        this.description = "Atom Probe Tomography";
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Mode", [
                        {name: "FIM", value: "fim"},
                        {name: "Voltage", value: "voltage"},
                        {name: "Laser", value: "laser"}
                    ]),
                    createTemperature("Specimen Temperature"),
                    createNumber("Voltage Pulse Fraction", ["percentage"]),
                    createNumber("Laser Pulse Energy", ["pJ", "nJ"]),
                    createNumber("Laser Wavelength", ["nm"]),
                    createNumber("Pulse Frequency", ["kHz"]),
                    createSelection("Evaporation Control", "evaporation_control", [
                        {name: "Constant Detector Rate", value: "constant_detector_rate"},
                        {name: "Constant Evaporation Rate", value: "constant_evaporation_rate"},
                        {name: "Constant Charge Rate Ratio", value: "constant_charge_rate_ratio"},
                        {name: "Other", value: "other"}
                    ]),
                    createNumber("Evaporation Rate", ["Atom/Pulse"]),
                    createSelection("Imaging Gas", [
                        {name: "He", value: "He"},
                        {name: "Ar", value: "Ar"},
                        {name: "Ne", value: "Ne"},
                        {name: "Other", value: "other"},
                        {name: "None", value: "none"}
                    ]),
                    createNumber("Pressure", ["atm", "Pa", "torr"])
                ]
            }
        ];
    }
}

class SemTemplate extends TemplateBase {
    constructor() {
        super("SEM", "measurement", false, false);
        this.description = "Stem Electron Microscopy";
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createVoltage(),
                    createCurrent(),
                    createNumber("Stage Tilt", ["degrees"]),
                    createNumber("Magnification", []),
                    createNumber("Specimen/Stage Bias", ["V"]),
                    createSelection("Stage", [
                        {name: "Standard", value: "standard"},
                        {name: "Cryo", value: "cryo"}
                    ]),
                    createSelection("Detector", [
                        {name: "Secondary", value: "secondary"},
                        {name: "Backscattered", value: "backscattered"},
                        {name: "Other", value: "other"}
                    ]),
                    createNumber("Working Distance", ["mm"])
                ]
            }
        ];
    }
}

class CreateSamplesTemplate extends TemplateBase {
    constructor() {
        super("Create Samples", "create", true, false);
        this.description = "Create Sample process is used to create new samples";
        this.measurements = [
            {
                name: "Composition",
                attribute: "composition",
                description: "",
                value: [],
                units: [],
                unit: "at%",
                otype: "composition",
                required: false,
                choices: []
            }
        ];
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createString("Manufacturer"),
                    createString("Supplier"),
                    createDate("Manufacturing Date"),
                    createSelection("Production Method", [
                        {name: "Cast", value: "cast"},
                        {name: "Extruded", value: "extruded"},
                        {name: "Rolled", value: "rolled"},
                        {name: "Unknown", value: "unknown"},
                        {name: "Other", value: "other"}
                    ])
                ]
            }
        ];
    }
}

class SectioningTemplate extends TemplateBase {
    constructor() {
        super("Sectioning", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createString("Notes")
                ]
            }
        ];
    }
}

class AptDataAnalysisTemplate extends TemplateBase {
    constructor() {
        super("APT Data Analysis", "analysis", false, false);
        this.description = "Atom Probe Tomography Data Analysis";
        this.setup = [
            {
                name: "System Information",
                attribute: "system_information",
                properties: [
                    createString("Software"),
                    createString("Software URL"),
                    createString("Software Version"),
                    createString("How To Cite")
                ]
            }
        ];
    }
}

class AptDataReconstructionTemplate extends TemplateBase {
    constructor() {
        super("APT Data Reconstruction", "analysis", false, false);
        this.description = "Atom Probe Tomography Data Reconstruction";
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Reconstruction Mode", [
                        {name: "Voltage", value: "voltage"},
                        {name: "Shank Angle", value: "shank_angle"},
                        {name: "Tip Image", value: "tip_image"},
                        {name: "Other", value: "other"}
                    ]),
                    createNumber("Field Factor", []),
                    createNumber("Image Compression Factor", []),
                    createNumber("Evaporatoin Field", ["V/nm"]),
                    createNumber("Detection Efficiency", ["percentage"]),
                    createNumber("Initial Radius", ["nm"]),
                    createNumber("Shank Angle", ["degrees", "rad"]),
                    createNumber("Cone To Sphere Ratio", [])
                ]
            }
        ];
    }
}

class BroadIonBeamMillingTemplate extends TemplateBase {
    constructor() {
        super("Broad Ion Beam Milling", "measurement", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Ion Type", [
                        {name: "Ga", value: "Ga"},
                        {name: "Ne", value: "Ne"},
                        {name: "Ar", value: "Ar"},
                        {name: "Other", value: "other"}
                    ]),
                    createNumber("Energy", ["V"]),
                    createTime()
                ]
            }
        ];
    }
}

class CoggingTemplate extends TemplateBase {
    constructor() {
        super("Cogging", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createTemperature(),
                    createStrain()
                ]
            }
        ];
    }
}

class CompressionTemplate extends TemplateBase {
    constructor() {
        super("Compression", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createTemperature(),
                    createStrain("True Strain"),
                    createStrain("Engineering Strain"),
                    createNumber("Strain Rate", ["1/s", "mm/min"]),
                    createStrain("Target Total Strain"),
                    createNumber("Load Rate", [])
                ]
            }
        ];
    }
}

class ComputationTemplate extends TemplateBase {
    constructor() {
        super("Computation", "analysis", false, false);
        this.setup = [
            {
                name: "Job Settings",
                attribute: "job_settings",
                properties: [
                    createString("Submit Script"),
                    createNumber("Number Of Processors", []),
                    createNumber("Memory Per Processor", ["b", "kb", "mb", "gb"]),
                    createTime("Walltime")
                ]
            }
        ];
    }
}

class CreepTemplate extends TemplateBase {
    constructor() {
        super("Creep", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createTemperature(),
                    createString("Environment"),
                    createNumber("Stress", ["MPa"])
                ]
            }
        ];
    }
}

class DicPatterningTemplate extends TemplateBase {
    constructor() {
        super("DIC Patterning", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Scale", [
                        {name: "Large-Scale", value: "large_scale"},
                        {name: "Small-Scale", value: "small_scale"}
                    ]),
                    createNumber("Field Of View", ["microns"]),
                    createNumber("Particle Size", ["microns", "nm"]),
                    createSelection("Particle Type", [
                        {name: "Alumina", value: "alumina"},
                        {name: "Gold", value: "gold"}
                    ]),
                    createSelection("Silane Type", [
                        {name: "APTMS", value: "aptms"},
                        {name: "MPTMS", value: "mptms"},
                        {name: "N/A", value: "n/a"}
                    ])
                ]
            }
        ];
    }
}

class DicStatisticalModellingTemplate extends TemplateBase {
    constructor() {
        super("DIC Statistical Modelling", "analysis", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createNumber("Number Of Parameters", []),
                    createNumber("Number Of Observations", []),
                    createSelection("Model Type", [
                        {name: "Linear", value: "linear"},
                        {name: "Interactions", value: "interactions"},
                        {name: "PureQuadratic", value: "purequadratic"},
                        {name: "Quadratic", value: "quadratic"}
                    ])
                ]
            }
        ];
    }
}

class ElectropolishingTemplate extends TemplateBase {
    constructor() {
        super("Electropolishing", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createString("Solution"),
                    createVoltage(),
                    createCurrent(),
                    createTemperature()
                ]
            }
        ];
    }
}

class EtchingTemplate extends TemplateBase {
    constructor() {
        super("Etching", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createString("Solution"),
                    createVoltage(),
                    createTime(),
                    createTemperature()
                ]
            }
        ];
    }
}

class EbsdSemDataCollectionTemplate extends TemplateBase {
    constructor() {
        super("EBSD SEM Data Collection", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createVoltage(),
                    createCurrent(),
                    createNumber("Sample Tilt", ["degress"]),
                    createNumber("Magnification", []),
                    createSmallTime("Acquisition Time"),
                    createNumber("Scan Size", ["microns"]),
                    createNumber("Step Size", ["microns"]),
                    createNumber("Working Distance", ["mm"])
                ]
            }
        ];
    }
}

class EpmaDataCollectionTemplate extends TemplateBase {
    constructor() {
        super("EPMA Data Collection", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createVoltage(),
                    createCurrent("Beam Current"),
                    createNumber("Beam Size", ["microns"]),
                    createSelection("Scan Type", [
                        {name: "Line", value: "line"},
                        {name: "Grid", value: "grid"},
                        {name: "Point", value: "point"}
                    ]),
                    createNumber("Step Size", ["microns"]),
                    createString("Grid Dimensions"),
                    createString("Location")
                ]
            }
        ];
    }
}

class LowCycleFatigueTemplate extends TemplateBase {
    constructor() {
        super("Low Cycle Fatigue", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Mode", [
                        {name: "Total strain control", value: "total_strain_control"},
                        {name: "Plastic strain control", value: "plastic_strain_control"},
                        {name: "Stress control", value: "stress_control"},
                        {name: "Displacement control", value: "displacement_control"}
                    ]),
                    createTemperature(),
                    createNumber("Frequency"),
                    createSelection("Wave Form", [
                        {name: "Continuous", value: "continuous"},
                        {name: "Interrupted( with hold times)", value: "interrupted"}
                    ]),
                    createSelection("Wave Form Shape", [
                        {name: "Sinusoidal", value: "sinusoidal"},
                        {name: "Rectangular", value: "rectangular"},
                        {name: "Triangular", value: "triangular"}
                    ]),
                    createSelection("Amplitude", [
                        {name: "Constant", value: "constant"},
                        {name: "Variable", value: "variable"}
                    ]),
                    createNumber("Load Ratio", []),
                    createString("Manufacturer"),
                    createStrain("Strain Limits")
                ]
            }
        ];
    }
}

class UltrasonicFatigueTemplate extends TemplateBase {
    constructor() {
        super("Ultrasonic Fatigue", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createNumber("Amplifiers Count", []),
                    createNumber("Power Control", []),
                    createNumber("Resonating Frequency", ["kHz"]),
                    createNumber("Calibration Constant", []),
                    createNumber("Stress Ratio", []),
                    createNumber("Max Stress", ["MPa"]),
                    createTemperature("Test Temperature"),
                    createString("Test Environment")
                ]
            }
        ];
    }
}

class TemTemplate extends TemplateBase {
    constructor() {
        super("TEM", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createVoltage(),
                    createSelection("Mode", [
                        {name: "Diffraction", value: "diffraction"},
                        {name: "Diffraction Imaging", value: "diffraction_imaging"},
                        {name: "High Resolution Imaging", value: "high_resolution_imaging"},
                        {name: "Scanning z-contrast", value: "scanning_z_contrast"}
                    ]),
                    createSelection("Conventional Scanning", [
                        {name: "Yes", value: "yes"},
                        {name: "No", value: "no"}
                    ]),
                    createSelection("Scanning", [
                        {name: "Bright Field", value: "bright_field"},
                        {name: "High Angle Angular Dark Field", value: "high_angle_angular_dark_field"},
                        {name: "Tilt Series", value: "tilt_series"}
                    ]),
                    createSelection("Stage", [
                        {name: "Standard", value: "standard"},
                        {name: "Cryo", value: "cryo"},
                        {name: "Heating", value: "heating"},
                        {name: "Other", value: "other"}
                    ]),
                    createString("Apparatus"),
                    createNumber("Spot Size", []),
                    createNumber("Camera Length", ["cm", "mm", "m"])
                ]
            }
        ];
    }
}

class HeatTreatmentTemplate extends TemplateBase {
    constructor() {
        super("Heat Treatment", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createTemperature(),
                    createTime(),
                    createSelection("Cooling Type", [
                        {name: "Air Quench", value: "air_quench"},
                        {name: "Water Quench", value: "water_quench"},
                        {name: "Furnace Cooled", value: "furnace_cooled"},
                        {name: "Air Cooled", value: "air_cooled"}
                    ]),
                    createNumber("Cooling Rate", ["C/s", "K/s"])
                ]
            }
        ];
    }
}

class AsMeasuredTemplate extends TemplateBase {
    constructor() {
        super("As Measured", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: []
            }
        ];
    }
}

class HardnessTemplate extends TemplateBase {
    constructor() {
        super("Hardness", "measurement", false, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Type", [
                        {name: "Vickers", value: "vickers"},
                        {name: "Rockwell A", value: "rockwell_a"},
                        {name: "Rockwell B", value: "rockwell_b"},
                        {name: "Rockwell C", value: "rockwell_c"}
                    ]),
                    createNumber("Load", ["ibf", "N"]),
                    createTime("Dwell Time")
                ]
            }
        ];
    }
}

class XrdTemplate extends TemplateBase {
    constructor() {
        super("XRD", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createString("Type"),
                    createNumber("Start Angle", ["degrees"]),
                    createNumber("End Angle", ["degrees"]),
                    createNumber("Rate", ["degrees/minute"]),
                    createNumber("Step Size", ["degrees"])
                ]
            }
        ];
    }
}

class TensionTemplate extends TemplateBase {
    constructor() {
        super("Tension", "transform", true, false);
        this.setup = [
            {
                name: "Instrument",
                attribute: "instrument",
                properties: [
                    createSelection("Force Type", [
                        {name: "Screw", value: "screw"},
                        {name: "Hydraulic", value: "hydraulic"}
                    ]),
                    createSelection("Control Mode", [
                        {name: "Displacement", value: "displacement"},
                        {name: "Force", value: "force"},
                        {name: "Strain", value: "strain"}
                    ]),
                    createTemperature(),
                    createString("Test Rate"),
                    createNumber("Gage Length", ["mm", "cm"]),
                    createSelection("Sample Geometry", [
                        {name: "Rectangular", value: "rectangular"},
                        {name: "Cylindrical", value: "cylindrical"}
                    ])
                ]
            }
        ];
    }
}

var ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

console.log(ropts);
var r = require('rethinkdbdash')(ropts);
var bluebird = require('bluebird');
var assert = require('assert');

var globalTemplates = [
    AptTemplate,
    SemTemplate,
    CreateSamplesTemplate,
    SectioningTemplate,
    AptDataAnalysisTemplate,
    AptDataReconstructionTemplate,
    BroadIonBeamMillingTemplate,
    CoggingTemplate,
    CompressionTemplate,
    ComputationTemplate,
    CreepTemplate,
    DicPatterningTemplate,
    DicStatisticalModellingTemplate,
    ElectropolishingTemplate,
    EtchingTemplate,
    EbsdSemDataCollectionTemplate,
    EpmaDataCollectionTemplate,
    LowCycleFatigueTemplate,
    UltrasonicFatigueTemplate,
    TemTemplate,
    HeatTreatmentTemplate,
    AsMeasuredTemplate,
    HardnessTemplate,
    XrdTemplate,
    TensionTemplate
];

console.log("Inserting templates...");
var doneCount = 0;
for (var i = 0; i < globalTemplates.length; i++) {
    var t = globalTemplates[i];
    var o = new t();
    var id = 'global_' + o.process_name;
    o.id = id;
    console.log('  ' + id);
    bluebird.coroutine(function*(o) {
        try {
            var result = yield r.table('templates').insert(o, {conflict: 'replace'});
            doneCount++;
            if (doneCount === globalTemplates.length) {
                console.log('Done.');
                process.exit(0);
            }
            assert.equal(result.errors, 0);
        } catch (err) {
            console.log(err);
        }
    })(o);
}