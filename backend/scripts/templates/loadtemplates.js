#!/usr/bin/env node --harmony

'use strict';

function nameToAttr (name) {
    return name.replace(/\s+/g, '_').replace(/\//g, '_').replace(/-/g, '_').toLowerCase()
}

function toSelectionChoices (choices) {
    return choices.map(choice => ({name: choice, value: nameToAttr(choice)}))
}

const UNITS_TEMPERATURE = ["K", "F", "C"];
const UNITS_VOLTAGE = ["kV", "V"];
const UNITS_CURRENT = ["A", "mA", "nA"];
const UNITS_TIME = ["h", "m", "s"];
const UNITS_STIME = ["s", "ms"];
const UNITS_STRAIN = ["mm/mm", "percentage"];

class TemplateBase {
    constructor (name, processType, doesTransform, destructive) {
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

    addSetup (name) {
        let s = new Setup(name);
        this.setup.push(s);
        return s;
    }

    setCategory (category) {
        this.category = category;
    }
}

function mkname (name, other) {
    return `${name} ${other}`;
}

class Setup {
    constructor (name) {
        this.name = name;
        this.attribute = nameToAttr(name);
        this.properties = [];
        this.currentProp = undefined;
    }

    property (name, otype) {
        let p = new Property(name, otype);
        this.currentProp = p;
        this.properties.push(p);
        return this;
    }

    pdescription (d) {
        this.currentProp.description = d;
        return this;
    }

    number (name) {
        return this.property(name, "number");
    }

    units (...units) {
        this.currentProp.addUnits(...units);
        return this;
    }

    number_with_units (name, ...units) {
        this.property(name, "number");
        this.currentProp.addUnits(...units);
        return this;
    }

    selection (name) {
        return this.property(name, "selection")
    }

    choices (...choices) {
        this.currentProp.addChoices(...choices);
        return this;
    }

    string (name) {
        return this.property(name, "string");
    }

    date (name) {
        return this.property(name, "date");
    }

    bool (name) {
        return this.property(name, 'boolean')
    }

    temperature (name) {
        return this.number_with_units(name ? name : "Temperature", ...UNITS_TEMPERATURE);
    }

    voltage (name) {
        return this.number_with_units(name ? name : "Voltage", ...UNITS_VOLTAGE);
    }

    current (name) {
        return this.number_with_units(name ? name : "Current", ...UNITS_CURRENT);
    }

    time (name) {
        return this.number_with_units(name ? name : "Time", ...UNITS_TIME);
    }

    stime (name) {
        return this.number_with_units(name ? name : "Time", ...UNITS_STIME);
    }

    strain (name) {
        return this.number_with_units(name ? name : "Strain", ...UNITS_STRAIN);
    }

    solver (name) {
        return this.string(mkname(name, 'Solver Type'))
            .string(mkname(name, 'Solver Preconditioner Type'))
            .selection(mkname(name, 'Solver Tolerance Type')).choices("Relative", "Absolute")
            .number(mkname(name, 'Solver Tolerance'))
            .number(mkname(name, 'Solver Max Iterations'));
    }

    finiteElementBasis (name) {
        return this.number(mkname(name, 'Order')).number(mkname(name, 'Quadrature Order'));
    }

    mesh (name) {
        return this.string(mkname(name, 'Filename')).meshgrid(name);
    }

    meshgrid (name) {
        return this.number(mkname(name, 'Dimension'))
            .vector(name, 'Span').vectorType('float')
            .pdescription("A vector of float with length equal to calculation dimension, giving the distance span.")
            .vector(name, 'Subdivisions').vectorType('integer')
            .pdescription("A vector of integer with length equal to calculation dimension, giving the number of mesh subdivisions along each dimension.")
            .number(mkname(name, 'Initial Refinement Factor')).pdescription("Initial mesh refinement factor of each subdivision");
    }

    vector (name) {
        return this.property(name, "vector");
    }

    vectorType (t) {
        this.currentProp.value = {
            otype: t,
            value: [],
            dimensions: 0
        };
        return this;
    }

    meshAdaptivityParameters (name) {
        return this.number(mkname(name, 'Max Refinement Factor'))
            .number(mkname(name, 'Min Refinement Factor'))
            .string(mkname(name, 'Refinement Criteria')).pdescription('Indices or names of fields that control refinement.')
            .selection(mkname(name, 'Refinement Type')).choices('Window', 'Ellipsoidal Shell')
            .number(mkname(name, 'Window Refinement Max'))
            .number(mkname(name, 'Window Refinement Min'))
            .vector(mkname(name, 'Ellipsoid Center')).vectorType('float')
            .vector(mkname(name, 'Inner Semi-Axes')).vectorType('float')
            .vector(mkname(name, 'Outer Semi-Axes')).vectorType('float')
            .number(mkname(name, 'Skip Remeshing Steps'));
    }

    software (name) {
        return this.string(mkname(name, 'Software Name'))
            .string(mkname(name, 'Software Version')).pdescription('Version number or commit hash')
            .string(mkname(name, 'Software URL'));
    }

    done () {
        this.currentProp = undefined;
    }
}

class Property {
    constructor (name, otype) {
        this.name = name;
        this.attribute = nameToAttr(name);
        this.required = false;
        this.units = [];
        this.unit = "";
        this.value = "";
        this.otype = otype;
        this.description = "";
        this.choices = [];
    }

    addUnits (...units) {
        this.unit = units.length === 1 ? units[0] : "";
        this.units = units.length === 0 || units.length === 1 ? [] : units;
    }

    addChoices (...choices) {
        this.choices = toSelectionChoices(choices);
    }
}

/**
 * Sample Creation
 */

// Physical Samples

class CreateSamplesTemplate extends TemplateBase {
    constructor () {
        super("Create Samples", "create", true, false);
        this.description = "Create Sample process is used to create new samples";
        this.setCategory("create_sample");
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
        this.addSetup("Instrument")
            .string("Manufacturer")
            .string("Supplier")
            .date("Manufacturing Date")
            .selection("Production Method").choices("Cast", "Extruded", "Rolled", "Unknown", "Other")
            .done()
    }
}

// Computational Samples


/******* End Sample Creation Templates *******/

/**
 * Experimental Process Templates
 */

class AptTemplate extends TemplateBase {
    constructor () {
        super("APT", "measurement", false, false);
        this.description = "Atom Probe Tomography";
        this.addSetup("Instrument")
            .selection("Mode").choices("FIM", "Voltage", "Laser")
            .temperature("Specimen Temperature")
            .number("Voltage Pulse Fraction").units("percentage")
            .number("Laser Pulse Energy").units("pJ", "nJ")
            .number("Laser Wavelength").units("nm")
            .number("Pulse Frequency").units("kHz")
            .selection("Evaporation Control")
            .choices(
                "Constant Detector Rate",
                "Constant Evaporation Rate",
                "Constant Charge Rate Ratio",
                "Other")
            .number("Evaporation Rate").units("Atom/Pulse")
            .selection("Imaging Gas").choices("He", "Ar", "Ne", "Other", "None")
            .number("Pressure").units("atm", "Pa", "torr")
            .done();
    }
}

class SemTemplate extends TemplateBase {
    constructor () {
        super("SEM", "measurement", false, false);
        this.description = "Stem Electron Microscopy";
        this.addSetup("Instrument")
            .voltage()
            .current()
            .number("Stage Tilt").units("degrees")
            .number("Magnification")
            .number("Specimen/Stage Bias").units("V")
            .selection("Stage").choices("Standard", "Cryo")
            .selection("Detector").choices("Secondary", "Backscattered", "Other")
            .number("Working Distance").units("mm")
            .done();
    }
}


class SectioningTemplate extends TemplateBase {
    constructor () {
        super("Sectioning", "transform", true, false);
        this.addSetup("Instrument").string("Notes").done();
        this.setCategory("sectioning");
    }
}

class AptDataAnalysisTemplate extends TemplateBase {
    constructor () {
        super("APT Data Analysis", "analysis", false, false);
        this.description = "Atom Probe Tomography Data Analysis";
        this.addSetup("Instrument")
            .string("Software")
            .string("Software URL")
            .string("Software Version")
            .string("How To Cite")
            .done();
    }
}

class AptDataReconstructionTemplate extends TemplateBase {
    constructor () {
        super("APT Data Reconstruction", "analysis", false, false);
        this.description = "Atom Probe Tomography Data Reconstruction";
        this.addSetup("Instrument")
            .selection("Reconstruction Mode").choices("Voltage", "Shank Angle", "Tip Image", "Other")
            .number("Field Factor")
            .number("Image Compression Factor")
            .number("Evaporatoin Field").units("V/nm")
            .number("Detection Efficiency").units("percentage")
            .number("Initial Radius").units("nm")
            .number("Shank Angle").units("degrees", "rad")
            .number("Cone To Sphere Ratio")
            .done();
    }
}

class BroadIonBeamMillingTemplate extends TemplateBase {
    constructor () {
        super("Broad Ion Beam Milling", "measurement", true, false);
        this.addSetup("Instrument")
            .selection("Ion Type").choices("Ga", "Ne", "Ar", "Other")
            .number("Energy").units("V")
            .time()
            .done();
    }
}

class CoggingTemplate extends TemplateBase {
    constructor () {
        super("Cogging", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .strain()
            .done();
    }
}

class CompressionTemplate extends TemplateBase {
    constructor () {
        super("Compression", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .strain("True Strain")
            .strain("Engineering Strain")
            .number("Strain Rate").units("1/s", "mm/min")
            .strain("Target Total Strain")
            .number("Load Rate")
            .done();
    }
}

class CreepTemplate extends TemplateBase {
    constructor () {
        super("Creep", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .string("Environment")
            .number("Stress").units("MPa")
            .done();
    }
}

class DicPatterningTemplate extends TemplateBase {
    constructor () {
        super("DIC Patterning", "measurement", false, false);
        this.addSetup("Instrument")
            .selection("Scale").choices("Large-Scale", "Small-Scale")
            .number("Field Of View").units("microns")
            .number("Particle Size").units("microns", "nm")
            .selection("Particle Type").choices("Alumina", "Gold")
            .selection("Silane Type").choices("APTMS", "MPTMS", "N/A")
            .done();
    }
}

class DicStatisticalModellingTemplate extends TemplateBase {
    constructor () {
        super("DIC Statistical Modelling", "analysis", false, false);
        this.addSetup("Instrument")
            .number("Number Of Parameters")
            .number("Number Of Observations")
            .selection("Model Type", "Linear").choices("Interactions", "PureQuadratic", "Quadratic")
            .done();
    }
}

class ElectropolishingTemplate extends TemplateBase {
    constructor () {
        super("Electropolishing", "transform", true, false);
        this.addSetup("Instrument")
            .string("Solution")
            .voltage()
            .current()
            .temperature()
            .done();
    }
}

class EtchingTemplate extends TemplateBase {
    constructor () {
        super("Etching", "transform", true, false);
        this.addSetup("Instrument")
            .string("Solution")
            .voltage()
            .time()
            .temperature()
            .done();
    }
}

class EbsdSemDataCollectionTemplate extends TemplateBase {
    constructor () {
        super("EBSD SEM Data Collection", "measurement", false, false);
        this.addSetup("Instrument")
            .voltage()
            .current()
            .number("Sample Tilt").units("degress")
            .number("Magnification")
            .stime("Acquisition Time")
            .number("Scan Size").units("microns")
            .number("Step Size").units("microns")
            .number("Working Distance").units("mm")
            .done();
    }
}

class EpmaDataCollectionTemplate extends TemplateBase {
    constructor () {
        super("EPMA Data Collection", "measurement", false, false);
        this.addSetup("Instrument")
            .voltage()
            .current("Beam Current")
            .number("Beam Size", "microns")
            .selection("Scan Type", "Line", "Grid", "Point")
            .number("Step Size", "microns")
            .string("Grid Dimensions")
            .string("Location")
            .done();
    }
}

class LowCycleFatigueTemplate extends TemplateBase {
    constructor () {
        super("Low Cycle Fatigue", "transform", true, false);
        this.addSetup("Instrument")
            .selection("Mode")
            .choices(
                "Total strain control", "Plastic strain control",
                "Stress control", "Displacement control")
            .temperature()
            .number("Frequency")
            .selection("Wave Form").choices("Continuous", "Interrupted with hold times")
            .selection("Wave Form Shape").choices("Sinusoidal", "Rectangular", "Triangular")
            .selection("Amplitude").choices("Constant", "Variable")
            .number("Load Ratio")
            .string("Manufacturer")
            .strain("Strain Limits")
            .done();
    }
}

class UltrasonicFatigueTemplate extends TemplateBase {
    constructor () {
        super("Ultrasonic Fatigue", "transform", true, false);
        this.addSetup("Instrument")
            .number("Amplifiers Count")
            .number("Power Control")
            .number("Resonating Frequency").units("kHz")
            .number("Calibration Constant")
            .number("Stress Ratio")
            .number("Max Stress").units("MPa")
            .temperature("Test Temperature")
            .string("Test Environment")
            .done();
    }
}

class TemTemplate extends TemplateBase {
    constructor () {
        super("TEM", "measurement", false, false);
        this.addSetup("Instrument")
            .voltage()
            .selection("Mode", "Diffraction").choices("Diffraction Imaging", "High Resolution Imaging", "Scanning z-contrast")
            .selection("Conventional Scanning").choices("Yes", "No")
            .selection("Scanning").choices("Bright Field", "High Angle Angular Dark Field", "Tilt Series")
            .selection("Stage").choices("Standard", "Cryo", "Heating", "Other")
            .string("Apparatus")
            .number("Spot Size")
            .number("Camera Length").units("cm", "mm", "m")
            .done();
    }
}

class HeatTreatmentTemplate extends TemplateBase {
    constructor () {
        super("Heat Treatment", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .time()
            .selection("Cooling Type").choices("Air Quench", "Water Quench", "Furnace Cooled", "Air Cooled")
            .number("Cooling Rate").units("C/s", "K/s")
            .done();
    }
}

class HardnessTemplate extends TemplateBase {
    constructor () {
        super("Hardness", "measurement", false, false);
        this.addSetup("Instrument")
            .selection("Type").choices("Vickers", "Rockwell A", "Rockwell B", "Rockwell C")
            .number("Load").units("ibf", "N")
            .time("Dwell Time")
            .done();
    }
}

class XrdTemplate extends TemplateBase {
    constructor () {
        super("XRD", "transform", true, false);
        this.addSetup("Instrument")
            .string("Type")
            .number("Start Angle").units("degrees")
            .number("End Angle").units("degrees")
            .number("Rate").units("degrees/minute")
            .number("Step Size").units("degrees")
            .done();
    }
}

class TensionTemplate extends TemplateBase {
    constructor () {
        super("Tension", "transform", true, false);
        this.addSetup("Instrument")
            .selection("Force Type").choices("Screw", "Hydraulic")
            .selection("Control Mode").choices("Displacement", "Force", "Strain")
            .temperature()
            .string("Test Rate")
            .number("Gage Length").units("mm", "cm")
            .selection("Sample Geometry").choices("Rectangular", "Cylindrical")
            .done();
    }
}

/******* End Experimental Process Templates *******/

/**
 * Computational Process Templates
 */

class ComputationTemplate extends TemplateBase {
    constructor () {
        super("Computation", "analysis", false, false);
        this.addSetup("Instrument")
            .string("Submit Script")
            .number("Number Of Processors")
            .number("Memory Per Processor").units("b", "kb", "mb", "gb")
            .time("Walltime")
            .done();
    }
}

class PhaseFieldCalculationTemplate extends TemplateBase {
    constructor () {
        super("Phase Field Calculation", "analysis", false, false);
        this.addSetup("Computation")
            .finiteElementBasis("FE Basis")
            .mesh("Mesh")
            .meshAdaptivityParameters("Mesh Adaptivity")
            .solver("Mechanics")
            .done();
    }
}

class DFTCalculationTemplate extends TemplateBase {
    constructor () {
        super("Density Functional Theory Calculation", "analysis", false, false);
        this.addSetup("Computation")
            .software('DFT')
            .string('Exchange Correlation Functional')
            .vector('Potential').vectorType('string').pdescription('Potential used, typically one element')
            .bool('Relax Ion Positions')
            .bool('Relax Latice Shape')
            .bool('Relax Lattice Volume')
            .done();
    }
}

class CASMMonteCarloCalculationTemplate extends TemplateBase {
    constructor () {
        super("CASM Monte Carlo Calculation", "analysis", false, false);
        this.addSetup("Computation")
            .done();
    }
}

/******* End Computational Process Templates *******/

/**
 * Generic Process Templates
 *
 */

class AsMeasuredTemplate extends TemplateBase {
    constructor () {
        super("As Measured", "measurement", false, false);
        this.addSetup("Instrument").done();
    }
}

/******* End Generic Process Templates *******/

let ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

console.log(ropts);
let r = require('rethinkdbdash')(ropts);
let bluebird = require('bluebird');
let assert = require('assert');

let globalTemplates = [
    // Physical Sample Creation Templates
    CreateSamplesTemplate,

    // Computational Sample Creation Templates

    // Experimental Process Templates
    AptTemplate,
    SemTemplate,
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
    HardnessTemplate,
    XrdTemplate,
    TensionTemplate,
    // Computational Process Templates
    PhaseFieldCalculationTemplate,
    DFTCalculationTemplate,
    CASMMonteCarloCalculationTemplate,

    // Generic Process Templates
    AsMeasuredTemplate
];

console.log("Inserting templates...");
let doneCount = 0;
for (let i = 0; i < globalTemplates.length; i++) {
    let t = globalTemplates[i];
    let o = new t();
    let id = 'global_' + o.process_name;
    o.id = id;
    console.log('  ' + id);
    bluebird.coroutine(function* (o) {
        try {
            let result = yield r.table('templates').insert(o, {conflict: 'replace'});
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