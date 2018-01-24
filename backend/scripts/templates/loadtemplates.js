#!/usr/bin/env node --harmony

'use strict';

function nameToAttr(name) {
    return name.replace(/\s+/g, '_').replace(/\//g, '_').replace(/-/g, '_').toLowerCase()
}

function toSelectionChoices(choices) {
    return choices.map(choice => ({name: choice, value: nameToAttr(choice)}))
}

const UNITS_TEMPERATURE = ["K", "F", "C"];
const UNITS_VOLTAGE = ["kV", "V"];
const UNITS_CURRENT = ["A", "mA", "nA"];
const UNITS_TIME = ["h", "m", "s"];
const UNITS_STIME = ["s", "ms"];
const UNITS_STRAIN = ["mm/mm", "percentage"];

class TemplateBase {
    constructor(name, processType, doesTransform, destructive) {
        this.name = name;
        this.process_name = name;
        this.owner = "template-admin";
        this.process_type = processType;
        this.description = name;
        this.category = "";
        this.does_transform = doesTransform;
        this.destructive = destructive;
        this.measurements = [];
        this.setup = [];
        this.otype = "template";
    }

    addSetup(name) {
        let s = new Setup(name);
        this.setup.push(s);
        return s;
    }

    setCategory(category) {
        this.category = category;
    }

    addMeasurements() {
        this.m = new Properties();
        return this.m;
    }

    measurementsDone() {
        this.measurements = this.m.properties;
        this.m = undefined;
    }
}

function mkname(name, other) {
    if (!name || name === '') {
        return other;
    }
    return `${name} ${other}`;
}

class Properties {
    constructor() {
        this.properties = [];
        this.currentProp = undefined;
    }

    property(name, otype) {
        let p = new Property(name, otype);
        this.currentProp = p;
        this.properties.push(p);
        return this;
    }

    composition(name) {
        let p = new Property(name, "composition");
        p.units = ["at%", "wt%", "atoms"];
        p.value = [];
        this.currentProp = p;
        this.properties.push(p);
        return this;
    }

    desc(d) {
        this.currentProp.description = d;
        return this;
    }

    number(name) {
        return this.property(name, "number");
    }

    integer(name) {
        return this.property(name, "integer");
    }

    float(name) {
        return this.property(name, "float");
    }

    units(...units) {
        this.currentProp.addUnits(...units);
        return this;
    }

    number_with_units(name, ...units) {
        this.property(name, "number");
        this.currentProp.addUnits(...units);
        return this;
    }

    selection(name) {
        return this.property(name, "selection")
    }

    choices(...choices) {
        this.currentProp.addChoices(...choices);
        return this;
    }

    string(name) {
        return this.property(name, "string");
    }

    func(name) {
        return this.property(name, "function");
    }

    date(name) {
        return this.property(name, "date");
    }

    bool(name) {
        return this.property(name, 'boolean')
    }

    temperature(name) {
        return this.number_with_units(name ? name : "Temperature", ...UNITS_TEMPERATURE);
    }

    voltage(name) {
        return this.number_with_units(name ? name : "Voltage", ...UNITS_VOLTAGE);
    }

    current(name) {
        return this.number_with_units(name ? name : "Current", ...UNITS_CURRENT);
    }

    time(name) {
        return this.number_with_units(name ? name : "Time", ...UNITS_TIME);
    }

    stime(name) {
        return this.number_with_units(name ? name : "Time", ...UNITS_STIME);
    }

    strain(name) {
        return this.number_with_units(name ? name : "Strain", ...UNITS_STRAIN);
    }

    solver(name) {
        return this.string(mkname(name, 'Solver Type'))
            .string(mkname(name, 'Solver Preconditioner Type'))
            .selection(mkname(name, 'Solver Tolerance Type')).choices("Relative", "Absolute")
            .float(mkname(name, 'Solver Tolerance'))
            .integer(mkname(name, 'Solver Max Iterations'));
    }

    finiteElementBasis(name) {
        return this.integer(mkname(name, 'Order')).integer(mkname(name, 'Quadrature Order'));
    }

    mesh(name) {
        return this.string(mkname(name, 'Filename')).meshgrid(name);
    }

    meshgrid(name) {
        return this.number(mkname(name, 'Dimension'))
            .vector(name, 'Span').vectorType('float')
            .desc("A vector of float with length equal to calculation dimension, giving the distance span.")
            .vector(name, 'Subdivisions').vectorType('integer')
            .desc("A vector of integer with length equal to calculation dimension, giving the number of mesh subdivisions along each dimension.")
            .integer(mkname(name, 'Initial Refinement Factor')).desc("Initial mesh refinement factor of each subdivision");
    }

    vector(name) {
        let p = new Property(name, "vector");
        this.currentProp = p;
        p.value = {
            otype: "",
            value: [],
            dimensions: 0
        };
        this.properties.push(p);
        return this;
    }

    vectorType(t) {
        this.currentProp.value.otype = t;
        return this;
    }

    vectorDim(dim) {
        this.currentProp.value.dimensions = dim;
        return this;
    }

    meshAdaptivityParameters(name) {
        return this.integer(mkname(name, 'Max Refinement Factor'))
            .integer(mkname(name, 'Min Refinement Factor'))
            .string(mkname(name, 'Refinement Criteria')).desc('Indices or names of fields that control refinement.')
            .selection(mkname(name, 'Refinement Type')).choices('Window', 'Ellipsoidal Shell')
            .float(mkname(name, 'Window Refinement Max'))
            .float(mkname(name, 'Window Refinement Min'))
            .vector(mkname(name, 'Ellipsoid Center')).vectorType('float')
            .vector(mkname(name, 'Inner Semi-Axes')).vectorType('float')
            .vector(mkname(name, 'Outer Semi-Axes')).vectorType('float')
            .integer(mkname(name, 'Skip Remeshing Steps'));
    }

    software(name) {
        return this.string(mkname(name, 'Software Name'))
            .string(mkname(name, 'Software Version')).desc('Version number or commit hash')
            .string(mkname(name, 'Software URL'));
    }

    mcConditions(name) {
        return this.float(mkname(name, "Temperature")).units("K")
            .vector(mkname(name, "Parametric Chemical Potential")).vectorType('float');
    }

    matrix(name, dimensions) {
        let p = new Property(name, "matrix");
        this.currentProp = p;
        p.value = {
            otype: "",
            value: [],
            dimensions: dimensions
        };
        this.properties.push(p);
        return this;
    }

    matrixType(t) {
        this.currentProp.value.otype = t;
        return this;
    }

    lattice(name) {
        return this.matrix(mkname(name, "Lattice"), [3, 3]).matrixType('float')
            .desc("Lattice vectores, respresented as columns of a matrix")
            .vector(mkname(name, "Parameters")).vectorType('float').vectorDim(6)
            .desc("Lattice parameters as[a, b, c, alpha, beta, gamma]")
            .selection(mkname(name, "Lattice System"))
            .choices("Triclinic", "Monoclinic", "Orthorhombic", "Tetragonal", "Hexagonal",
                "Rhombohedral", "Cubic")
            .string(mkname(name, "Symmetry")).desc("Schonflies symbol");
    }

    spaceGroup(name) {
        return this.string(mkname(name, "Schonflies Space Group Symbol"))
            .string(mkname(name, "Hermann-Mauguin Space Group Symbol"))
            .integer(mkname(name, "Space Group Number"))
            .desc("International Union of Crytallography space group number")
            .selection(mkname(name, "Crystal Family"))
            .choices("Triclinic", "Monoclinic", "Orthorhombic", "Tetragonal", "Hexagonal",
                "Cubic")
            .selection(mkname(name, "Crystal System"))
            .choices("Triclinic", "Monoclinic", "Orthorhombic", "Tetragonal", "Hexagonal",
                "Trigonal", "Cubic")
    }

    link(name, attr) {
        let p = new Property(name, attr);
        p.value = {};
        p.value[`${attr}_name`] = '';
        p.value[`${attr}_id`] = '';
        this.currentProp = p;
        this.properties.push(p);
        return this;
    }

    file(name) {
        return this.link(name, "file")
    }

    sample(name) {
        return this.link(name, "sample");
    }

    done() {
        this.currentProp = undefined;
    }
}

class Setup extends Properties {
    constructor(name) {
        super();
        this.name = name;
        this.attribute = nameToAttr(name);
    }
}

class Property {
    constructor(name, otype) {
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

    addUnits(...units) {
        this.unit = units.length === 1 ? units[0] : "";
        this.units = units.length === 0 || units.length === 1 ? [] : units;
    }

    addChoices(...choices) {
        this.choices = toSelectionChoices(choices);
    }
}

/**
 * Sample Creation
 */

// Physical Samples

class CreateSamplesTemplate extends TemplateBase {
    constructor() {
        super("Create Samples", "create", true, false);
        this.description = "Create Sample process is used to create new samples";
        this.setCategory("create_sample");

        this.addSetup("Instrument")
            .string("Manufacturer")
            .string("Supplier")
            .date("Manufacturing Date")
            .selection("Production Method").choices("Cast", "Extruded", "Rolled", "Unknown", "Other")
            .done();

        this.addMeasurements()
            .composition("Composition")
            .done();
        this.measurementsDone();
    }
}

// Computational Samples

class CreateAtomicConfigurationSamplesTemplate extends TemplateBase {
    constructor() {
        super("Atomic Configuration Samples", "create", true, false);
        this.setCategory("create_sample");

        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .string("Name")
            .lattice()
            .file("Crystallographic File")
            .spaceGroup()
            .integer("Number Of Elements").desc("Usually length of Elements.")
            .composition("Elements")
            .integer("Number Of Atoms")
            .done();
        this.measurementsDone();
    }
}

class CreatePrimitiveCrystalStructureSamplesTemplate extends TemplateBase {
    constructor() {
        super("Primitive Crystal Structure", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .string("Name")
            .lattice()
            .file("CASM PRISM File").desc("CASM prim.json type file.")
            .spaceGroup()
            .integer("Number Of Elements").desc("Usually length of Elements.")
            .composition("Elements")
            .integer("Number Of Components")
            .composition("Components")
            .integer("Number Of Independent Composition Variables")
            .vector("Degrees Of Freedom").vectorType("string")
            .done();
        this.measurementsDone();
    }
}

class CreateClusterExpansionEffectiveHamiltonianSamplesTemplate extends TemplateBase {
    constructor() {
        super("Cluster Expansion Effective Hamiltonian", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .sample("Prim")
            .file("Basis Function Specs").desc("CASM bspecs.json file.")
            .file("Effective Cluster Interactions").desc("CASM eci.json file.")
            .done();
        this.measurementsDone();
    }
}

class CreateCompositionAxesSamplesTemplate extends TemplateBase {
    constructor() {
        super("Composition Axes", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .vector("End Members Origin").vectorType('float')
            .vector("End Members A").vectorType('float')
            .vector("End Members B").vectorType('float')
            .vector("End Members C").vectorType('float')
            .vector("End Members D").vectorType('float')
            .sample("Prim")
            .string("Formula")
            .string("Parametric Formula")
            .done();
        this.measurementsDone();
    }
}

class CreateSinglePhaseSamplesTemplate extends TemplateBase {
    constructor() {
        super("Single Phase", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        let chname = (n) => `Cahn-Hilliard ${n}`;
        let lename = (n) => `Linear Plasticity Mechanics ${n}`;
        let stname = (n) => `Stiffness Tensor ${n}`;
        this.addMeasurements()
            .string("Phase Name")
            .string("Application")
            .desc("Describes the physical model. Ex: CahnHilliard, AllenCahn, CoupledCahnHilliardAllenCahn, etc...")
            .func(chname("Source"))
            .func(chname("Homogenous Free Energy Density"))
            .vector(chname("Concentration Gradient Penalty Coefficient Vector"))
            .vectorType('float').vectorDim(3)
            .matrix(chname("Concentration Gradient Penalty Coefficient Matrix"))
            .matrixType('float')
            .float(chname('Mobility'))
            .lattice(lename(''))
            .selection(lename("Symmetry of Stiffness Tensor")).choices(
            "Isotropic", "Anisotropic", "Transverse", "Orthotropic")
            .vector(stname("Isotropic 1d")).vectorType('float').vectorDim(1)
            .vector(stname("Isotropic 2d")).vectorType('float').vectorDim(2)
            .vector(stname("Isotropic 3d")).vectorType('float').vectorDim(2)
            .vector(stname("Anisotropic 2d")).vectorType('float').vectorDim(6)
            .vector(stname("Anisotropic 3d")).vectorType('float').vectorDim(21)
            .vector(stname("Transverse 3d")).vectorType('float').vectorDim(5)
            .vector(stname("Orthotropic 3d")).vectorType('float').vectorDim(9)
            .done();
        this.measurementsDone();
    }
}

class CreatePhaseInterfaceSamplesTemplate extends TemplateBase {
    constructor() {
        super("Phase Interface", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .vector("Phases").vectorType("string").vectorDim(2)
            .desc("The phases separated by this interface")
            .string("Model")
            .float("Allen-Cahn Mobility")
            .vector('Structural Order Parameter Gradient Penalty Coefficient Vector')
            .vectorType('float').vectorDim(3)
            .matrix('Structural Order Parameter Gradient Penalty Coefficient Matrix', [3, 3])
            .matrixType('float')
            .done();
        this.measurementsDone();
    }
}

class CreatePhaseFieldSystemSamplesTemplate extends TemplateBase {
    constructor() {
        super("Phase Field System", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .string("Application").desc("Describes the physical model. Ex: CahnHilliard, AllenCahn, CoupledCahnHilliardAllenCahn, etc...")
            .func("Interpolation Function")
            .done();
        this.measurementsDone();
    }
}

class CreateCPFESamplesTemplate extends TemplateBase {
    constructor() {
        super("CPFE Samples", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Computation").done();

        this.addMeasurements()
            .selection("Crystal Type").choices("FCC", "BCC", "HCP")
            .float("Latent Hardening Ratio")
            .integer("Number of Slip Systems")
            .vector("Initial Slip Resistance").vectorType("float").units("Pa").desc("Crtical resolved shear stress of slip systems")
            .vector("Initial Hardening Modulus").vectorType("float").units("Pa").desc("Hardening moduli of slip systems")
            .vector("Power Law Exponent").vectorType("float").desc("Power law coefficient")
            .vector("Saturation Stress").vectorType("float").units("Pa").desc("Saturation stress")
            .matrix("Elastic Stiffness", [6, 6]).matrixType("float").units("Pa")
            .integer("Number of Twin Systems")
            .vector("Initial Twin Slip Resistance").units("Pa").vectorType("float").desc("Critical resolved shear stress of twin systems")
            .vector("Initial Twin Hardening Modulus").units("Pa").vectorType("float").desc("Hardening moduli of twin systems")
            .vector("Twin Power Law Exponent").vectorType("float").desc("Power law coefficient")
            .vector("Twin Saturation Stress").units("Pa").vectorType("float").desc("Saturation stress")
            .float("Twin Shear").desc("Charateristic twin shear")
            .float("Twin Threshold Fraction").desc("Threshold fraction of characteristic twin shear")
            .float("Twin Saturation Factor").desc("Twin growth saturation factor")
            .done();
        this.measurementsDone();
    }
}

/******* End Sample Creation Templates *******/

/**
 * Experimental Process Templates
 */

class AptTemplate extends TemplateBase {
    constructor() {
        super("APT", "measurement", false, false);
        this.description = "Atom Probe Tomography";
        this.addSetup("Instrument")
            .selection("Mode").choices("FIM", "Voltage", "Laser")
            .temperature("Specimen Temperature")
            .number("Voltage Pulse Fraction").units("percentage")
            .number("Laser Pulse Energy").units("pJ", "nJ")
            .number("Laser Wavelength").units("nm")
            .number("Pulse Frequency").units("kHz")
            .selection("Evaporation Control").choices(
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
    constructor() {
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
    constructor() {
        super("Sectioning", "transform", true, false);
        this.addSetup("Instrument").string("Notes").done();
        this.setCategory("sectioning");
    }
}

class AptDataAnalysisTemplate extends TemplateBase {
    constructor() {
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
    constructor() {
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
    constructor() {
        super("Broad Ion Beam Milling", "measurement", true, false);
        this.addSetup("Instrument")
            .selection("Ion Type").choices("Ga", "Ne", "Ar", "Other")
            .number("Energy").units("V")
            .time()
            .done();
    }
}

class CoggingTemplate extends TemplateBase {
    constructor() {
        super("Cogging", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .strain()
            .done();
    }
}

class CompressionTemplate extends TemplateBase {
    constructor() {
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
    constructor() {
        super("Creep", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .string("Environment")
            .number("Stress").units("MPa")
            .done();
    }
}

class DicPatterningTemplate extends TemplateBase {
    constructor() {
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
    constructor() {
        super("DIC Statistical Modelling", "analysis", false, false);
        this.addSetup("Instrument")
            .number("Number Of Parameters")
            .number("Number Of Observations")
            .selection("Model Type", "Linear").choices("Interactions", "PureQuadratic", "Quadratic")
            .done();
    }
}

class ElectropolishingTemplate extends TemplateBase {
    constructor() {
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
    constructor() {
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
    constructor() {
        super("EBSD SEM Data Collection", "measurement", false, false);
        this.addSetup("Instrument")
            .voltage()
            .current()
            .number("Sample Tilt").units("degress")
            .number("Magnification")
            .stime("Acquisition Time")
            .number("Scan Size Width").units("microns")
            .number("Scan Size Height").units("microns")
            .number("Step Size").units("microns")
            .number("Working Distance").units("mm")
            .string("Horizontal Direction")
            .string("Vertical Direction")
            .done();
    }
}

class EpmaDataCollectionTemplate extends TemplateBase {
    constructor() {
        super("EPMA Data Collection", "measurement", false, false);
        this.addSetup("Instrument")
            .voltage()
            .current("Beam Current")
            .number("Beam Size", "microns")
            .selection("Scan Type").choices("Line", "Grid", "Point")
            .number("Step Size", "microns")
            .string("Grid Dimensions")
            .string("Location")
            .number("Number of points")
            .done();
    }
}

class LowCycleFatigueTemplate extends TemplateBase {
    constructor() {
        super("Low Cycle Fatigue", "transform", true, false);
        this.addSetup("Instrument")
            .selection("Mode").choices(
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
    constructor() {
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
    constructor() {
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
    constructor() {
        super("Heat Treatment", "transform", true, false);
        this.addSetup("Instrument")
            .temperature()
            .time()
            .selection("Cooling Type").choices(
            "Air Quench", "Water Quench", "Furnace Cooled", "Air Cooled", "Gas Cooled")
            .number("Cooling Rate").units("C/s", "K/s")
            .done();
    }
}

class HardnessTemplate extends TemplateBase {
    constructor() {
        super("Hardness", "measurement", false, false);
        this.addSetup("Instrument")
            .selection("Type").choices("Vickers", "Rockwell A", "Rockwell B", "Rockwell C")
            .number("Load").units("ibf", "N")
            .time("Dwell Time")
            .done();
    }
}

class XrdTemplate extends TemplateBase {
    constructor() {
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
    constructor() {
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
    constructor() {
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
    constructor() {
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
    constructor() {
        super("Density Functional Theory Calculation", "analysis", false, false);
        this.addSetup("Computation")
            .software('DFT')
            .string('Exchange Correlation Functional')
            .vector('Potential').vectorType('string').desc('Potential used, typically one element')
            .bool('Relax Ion Positions')
            .bool('Relax Latice Shape')
            .bool('Relax Lattice Volume')
            .done();
    }
}

class CASMMonteCarloCalculationTemplate extends TemplateBase {
    constructor() {
        super("CASM Monte Carlo Calculation", "analysis", false, false);
        this.addSetup("Computation")
            .selection("Ensemble").choices("grand_cononical")
            .selection("Method").choices("metropolis", "lte1")
            .matrix("Supercell Transformation Matrix", [3, 3]).matrixType('integer')
            .desc("Supercell lattice = Primitive lattice * transformation matrix, where lattice vectors are represented as columns.")
            .selection("Mode").choices("Incremental", "Custom")
            .string("Motif")
            .mcConditions("Initial Conditions")
            .mcConditions("Final Conditions")
            .mcConditions("Incremental Conditions")
            .vector("Custom Conditions Temperature").vectorType("float").units("K")
            .matrix("Custom Conditions Parametric Chemical Potential", [1, 1]).matrixType("float")
            .done();
    }
}

class CrystalPlasticityFiniteElementTemplate extends TemplateBase {
    constructor() {
        super("Crystal Plasticity Finite Element", "analysis", false, false);
        this.addSetup("Computation")
            .finiteElementBasis('Finite Element Basis')
            .mesh("Mesh")
            .solver("Linear Solver")
            .solver("Nonlinear Solver")
            .done();
    }
}

/******* End Computational Process Templates *******/

/**
 * Generic Process Templates
 *
 */

class AsMeasuredTemplate extends TemplateBase {
    constructor() {
        super("As Measured", "measurement", false, false);
        this.addSetup("Instrument").done();
    }
}

class GenericMeasurementTemplate extends TemplateBase {
    constructor() {
        super("Generic Measurement Template", "measurement", false, false);
        this.addSetup("Instrument").done();
    }
}

class GenericCreateSampleTemplate extends TemplateBase {
    constructor() {
        super("Generic Create Samples Template", "create", true, false);
        this.setCategory("create_sample");
        this.addSetup("Instrument").done();
        this.addMeasurements().composition("Composition").done();
        this.measurementsDone();
    }
}

class GenericTransformSampleTemplate extends TemplateBase {
    constructor() {
        super("Generic Transform Samples Template", "transform", true, false);
        this.addSetup("Instrument").done();
    }
}

class GenericAnalysisTemplate extends TemplateBase {
    constructor() {
        super("Generic Analysis Template", "analysis", false, false);
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
    CreateAtomicConfigurationSamplesTemplate,
    CreatePrimitiveCrystalStructureSamplesTemplate,
    CreateClusterExpansionEffectiveHamiltonianSamplesTemplate,
    CreateCompositionAxesSamplesTemplate,
    CreateSinglePhaseSamplesTemplate,
    CreatePhaseInterfaceSamplesTemplate,
    CreatePhaseFieldSystemSamplesTemplate,
    CreateCPFESamplesTemplate,

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
    CrystalPlasticityFiniteElementTemplate,

    // Generic Process Templates
    AsMeasuredTemplate,
    GenericMeasurementTemplate,
    GenericCreateSampleTemplate,
    GenericTransformSampleTemplate,
    GenericAnalysisTemplate
];

console.log("Inserting templates...");
let doneCount = 0;
for (let i = 0; i < globalTemplates.length; i++) {
    let t = globalTemplates[i];
    let o = new t();
    let id = 'global_' + o.process_name;
    o.id = id;
    console.log('  ' + id);
    bluebird.coroutine(function*(o) {
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