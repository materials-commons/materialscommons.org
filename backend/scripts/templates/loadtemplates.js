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

function Apt() {
    this.name = "APT";
    this.process_name = "APT";
    this.process_type = "measurement";
    this.description = "Atom Probe Tomography";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
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
                createNumber("Specimen Temperature", ["K", "F", "C"]),
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

function Sem() {
    this.name = "SEM";
    this.process_name = "SEM";
    this.process_type = "measurement";
    this.description = "Stem Electron Microscopy";
    this.category = "SEM";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createNumber("Voltage", ["kV"]),
                createNumber("Current", ["A"]),
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

function CreateSamples() {
    this.name = "Create Samples";
    this.process_name = "Create Samples";
    this.process_type = "create";
    this.description = "Create Sample process is used to create new samples.";
    this.category = "create_sample";
    this.does_transform = true;
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
    this.destructive = false;
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
    ]
}

function Sectioning() {
    this.name = "Sectioning";
    this.process_name = "Sectioning";
    this.process_type = "transform";
    this.description = "Sectioning";
    this.category = "create_sample";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
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


function AptDataAnalysis() {
    this.name = "APT Data Analysis";
    this.process_name = "APT Data Analysis";
    this.process_type = "analysis";
    this.description = "Atom Probe Tomography Data Analysis";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
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

function AptDataReconstruction() {
    this.name = "APT Data Reconstruction";
    this.process_name = "APT Data Reconstruction";
    this.process_type = "analysis";
    this.description = "Atom Probe Tomography Data Reconstruction";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
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

function BroadIonBeamMilling() {
    this.name = "Broad Ion Beam Milling";
    this.process_name = "Broad Ion Beam Milling";
    this.process_type = "measurement";
    this.description = "Broad Ion Beam Milling";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
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
                createNumber("Time", ["s"])
            ]
        }
    ];
}

function Cogging() {
    this.name = "Cogging";
    this.process_name = "Cogging";
    this.process_type = "transform";
    this.description = "Cogging";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createNumber("Temperature", ["C", "F", "K"]),
                createNumber("Strain", ["mm/mm", "percentage"])
            ]
        }
    ];
}

function Compression() {
    this.name = "Compression";
    this.process_name = "Compression";
    this.process_type = "transform";
    this.description = "Compression";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createNumber("Temperature", ["C", "F", "K"]),
                createNumber("True Strain", ["mm/mm", "percentage"]),
                createNumber("Engineering Strain", ["mm/mm", "percentage"]),
                createNumber("Strain Rate", ["1/s", "mm/min"]),
                createNumber("Target Total Strain", ["mm/mm", "percentage"]),
                createNumber("Load Rate", [])
            ]
        }
    ];
}

function Computation() {
    this.name = "Computation";
    this.process_name = "Computation";
    this.process_type = "analysis";
    this.description = "Computation";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Job Settings",
            attribute: "job_settings",
            properties: [
                createString("Submit Script"),
                createNumber("Number Of Processors", []),
                createNumber("Memory Per Processor", ["b", "kb", "mb", "gb"]),
                createNumber("Walltime", ["s"])
            ]
        }
    ];
}

function Creep() {
    this.name = "Creep";
    this.process_name = "Creep";
    this.process_type = "transform";
    this.description = "Creep";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createNumber("Temperature", ["C", "F", "K"]),
                createString("Environment"),
                createNumber("Stress", ["MPa"])
            ]
        }
    ];
}

function DicPatterning() {
    this.name = "DIC Patterning";
    this.process_name = "DIC Patterning";
    this.process_type = "measurement";
    this.description = "DIC Patterning";
    this.category = "DIC";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
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

function DicStatisticalModelling() {
    this.name = "DIC Statistical Modelling";
    this.process_name = "DIC Statistical Modelling";
    this.process_type = "analysis";
    this.description = "DIC Statistical Modelling";
    this.category = "DIC";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
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

function Electropolishing() {
    this.name = "Electropolishing";
    this.process_name = "Electropolishing";
    this.process_type = "transform";
    this.description = "Electropolishing";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createString("Solution"),
                createNumber("Voltage", ["V", "kV"]),
                createNumber("Current", ["mA", "A"]),
                createNumber("Temperature", ["C", "F", "K"])
            ]
        }
    ];
}

function Etching() {
    this.name = "Etching";
    this.process_name = "Etching";
    this.process_type = "transform";
    this.description = "Etching";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                createString("Solution"),
                createNumber("Voltage", ["V", "kV"]),
                createNumber("Time", ["hrs", "mins", "s"]),
                createNumber("Temperature", ["C", "F", "K"])
            ]
        }
    ];
}

function EbsdSemDataCollection() {
    this.name = "EBSD SEM Data Collection";
    this.process_name = "EBSD SEM Data Collection";
    this.process_type = "measurement";
    this.description = "EBSD SEM Data Collection";
    this.category = "SEM";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Voltage",
                    attribute: "voltage",
                    description: "",
                    value: "",
                    units: ["kv", "V"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Current",
                    attribute: "current",
                    description: "",
                    value: "",
                    units: ["A", "mA"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Sample Tilt",
                    attribute: "sample_tilt",
                    description: "",
                    value: "",
                    units: [],
                    unit: "degrees",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Magnification",
                    attribute: "magnification",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Acquisition Time",
                    attribute: "acquisition_time",
                    description: "",
                    value: "",
                    units: ["s", "ms"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Scan Size",
                    attribute: "scan_size",
                    description: "",
                    value: "",
                    units: ["microns"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Step Size",
                    attribute: "step_size",
                    description: "",
                    value: "",
                    units: [],
                    unit: "microns",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Working Distance",
                    attribute: "working_distance",
                    description: "",
                    value: "",
                    units: [],
                    unit: "mm",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function EpmaDataCollection() {
    this.name = "EPMA Data Collection";
    this.process_name = "EPMA Data Collection";
    this.process_type = "measurement";
    this.description = "EPMA Data Collection";
    this.category = "EPMA";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Voltage",
                    attribute: "voltage",
                    description: "",
                    value: "",
                    units: ["kv", "V"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Beam Current",
                    attribute: "beam_current",
                    description: "",
                    value: "",
                    units: ["A", "nA"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Beam Size",
                    attribute: "beam_size",
                    description: "",
                    value: "",
                    units: [],
                    unit: "microns",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Scan Type",
                    attribute: "scan_type",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Line", value: "line"},
                        {name: "Grid", value: "grid"},
                        {name: "Point", value: "point"}
                    ]
                },
                {
                    name: "Step Size",
                    attribute: "step_size",
                    description: "",
                    value: "",
                    units: [],
                    unit: "microns",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Grid Dimensions",
                    attribute: "grid_dimensions",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                },
                {
                    name: "Location",
                    attribute: "location",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function LowCycleFatigue() {
    this.name = "Low Cycle Fatigue";
    this.process_name = "Low Cycle Fatigue";
    this.process_type = "transform";
    this.description = "Low Cycle Fatigue";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Mode",
                    attribute: "mode",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Total strain control", value: "total_strain_control"},
                        {name: "Plastic strain control", value: "plastic_strain_control"},
                        {name: "Stress control", value: "stress_control"},
                        {name: "Displacement control", value: "displacement_control"}
                    ]
                },
                {
                    name: "Temperature",
                    attribute: "temperature",
                    description: "",
                    value: "",
                    units: ["K", "F", "C"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Frequency",
                    attribute: "frequency",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Wave Form",
                    attribute: "wave_form",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Continuous", value: "continuous"},
                        {name: "Interrupted( with hold times)", value: "interrupted"}
                    ]
                },
                {
                    name: "Wave Form Shape",
                    attribute: "wave_form_shape",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Sinusoidal", value: "sinusoidal"},
                        {name: "Rectangular", value: "rectangular"},
                        {name: "Triangular", value: "triangular"}
                    ]
                },
                {
                    name: "Amplitude",
                    attribute: "amplitude",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Constant", value: "constant"},
                        {name: "Variable", value: "variable"}
                    ]
                },
                {
                    name: "Load Ratio",
                    attribute: "load_ratio",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Manufacturer",
                    attribute: "manufacturer",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                },
                {
                    name: "Strain Limits",
                    attribute: "strain_limits",
                    description: "",
                    value: "",
                    units: [],
                    unit: "percentage",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function UltrasonicFatigue() {
    this.name = "Ultrasonic Fatigue";
    this.process_name = "Ultrasonic Fatigue";
    this.process_type = "transform";
    this.description = "Ultrasonic Fatigue";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Amplifiers (count)",
                    attribute: "amplifier_count",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Power Control",
                    attribute: "power_control",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Resonating Frequency",
                    attribute: "resonating_frequency",
                    description: "",
                    value: "",
                    units: [],
                    unit: "kHz",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Calibration Constant",
                    attribute: "calibration_constant",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Stress Ratio",
                    attribute: "stress_ratio",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Max Stress",
                    attribute: "max_stress",
                    description: "",
                    value: "",
                    units: [],
                    unit: "MPa",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Test Temperature",
                    attribute: "test_temperature",
                    description: "",
                    value: "",
                    units: ["C", "F", "K"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Test Environment",
                    attribute: "test_environment",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function TEM() {
    this.name = "TEM";
    this.process_name = "TEM";
    this.process_type = "measurement";
    this.description = "Transmission Electron Microscope";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Voltage",
                    attribute: "voltage",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Mode",
                    attribute: "mode",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Diffraction", value: "diffraction"},
                        {name: "Diffraction Imaging", value: "diffraction_imaging"},
                        {name: "High Resolution Imaging", value: "high_resolution_imaging"},
                        {name: "Scanning z-contrast", value: "scanning_z_contrast"}
                    ]
                },
                {
                    name: "Conventional Scanning",
                    attribute: "conventional_scanning",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Yes", value: "yes"},
                        {name: "No", value: "no"}
                    ]
                },
                {
                    name: "Scanning",
                    attribute: "scanning",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Bright Field", value: "bright_field"},
                        {name: "High Angle Angular Dark Field", value: "high_angle_angular_dark_field"},
                        {name: "Tilt Series", value: "tilt_series"}
                    ]
                },
                {
                    name: "Stage",
                    attribute: "stage",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Standard", value: "standard"},
                        {name: "Cryo", value: "cryo"},
                        {name: "Heating", value: "heating"},
                        {name: "Other", value: "other"}
                    ]
                },
                {
                    name: "Apparatus",
                    attribute: "apparatus",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                },
                {
                    name: "Spot Size",
                    attribute: "spot_size",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Camera Length",
                    attribute: "camera_length",
                    description: "",
                    value: "",
                    units: ["cm", "mm", "m"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function HeatTreatment() {
    this.name = "Heat Treatment";
    this.process_name = "Heat Treatment";
    this.process_type = "transform";
    this.description = "HeatTreatment";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Temperature",
                    attribute: "temperature",
                    description: "",
                    value: "",
                    units: ["K", "F", "C"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Time",
                    attribute: "time",
                    description: "",
                    value: "",
                    units: ["seconds", "minutes", "hours"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Cooling Type",
                    attribute: "cooling_type",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Air Quench", value: "air_quench"},
                        {name: "Water Quench", value: "water_quench"},
                        {name: "Furnace Cooled", value: "furnace_cooled"},
                        {name: "Air Cooled", value: "air_cooled"}
                    ]
                },
                {
                    name: "Cooling Rate",
                    attribute: "cooling_rate",
                    description: "",
                    value: "",
                    units: ["C/s", "K/s"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function AsMeasured() {
    this.name = "As Measured";
    this.process_name = "As Measured";
    this.process_type = "measurement";
    this.description = "As Measured process allows you to add in all your As Received measurements";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: []
        }
    ];
}

function Hardness() {
    this.name = "Hardness";
    this.process_name = "Hardness";
    this.process_type = "measurement";
    this.description = "Hardness";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Type",
                    attribute: "type",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "selection",
                    required: false,
                    choices: [
                        {name: "Vickers", value: "vickers"},
                        {name: "Rockwell A", value: "rockwell_a"},
                        {name: "Rockwell B", value: "rockwell_b"},
                        {name: "Rockwell C", value: "rockwell_c"}
                    ]
                },
                {
                    name: "Load",
                    attribute: "load",
                    description: "",
                    value: "",
                    units: ["ibf", "N"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Dwell Time",
                    attribute: "dwell_time",
                    description: "",
                    value: "",
                    units: ["seconds", "minutes", "hours"],
                    unit: "",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function XRD() {
    this.name = "XRD";
    this.process_name = "XRD";
    this.process_type = "transform";
    this.description = "XRD";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    name: "Type",
                    attribute: "type",
                    description: "",
                    value: "",
                    units: [],
                    unit: "",
                    otype: "string",
                    required: false,
                    choices: []
                },
                {
                    name: "Start Angle",
                    attribute: "start_angle",
                    description: "",
                    value: "",
                    units: [],
                    unit: "degrees",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "End Angle",
                    attribute: "end_angle",
                    description: "",
                    value: "",
                    units: [],
                    unit: "degrees",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Rate",
                    attribute: "rate",
                    description: "",
                    value: "",
                    units: [],
                    unit: "degrees/minute",
                    otype: "number",
                    required: false,
                    choices: []
                },
                {
                    name: "Step Size",
                    attribute: "step_size",
                    description: "",
                    value: "",
                    units: [],
                    unit: "degrees",
                    otype: "number",
                    required: false,
                    choices: []
                }
            ]
        }
    ];
}

function Tension() {
    this.name = "Tension";
    this.process_name = "Tension";
    this.process_type = "transform";
    this.description = "Tension";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.destructive = false;
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                        name: "Force type",
                        attribute: "force_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        otype: "selection",
                        required: false,
                        choices: [
                            {name: "Screw", value: "screw"},
                            {name: "Hydraulic", value: "hydraulic"}
                        ]
                },
                {
                        name: "Control Mode",
                        attribute: "control_mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        otype: "selection",
                        required: false,
                        choices: [
                            {name: "Displacement", value: "displacement"},
                            {name: "Force", value: "force"},
                            {name: "Strain", value: "strain"}
                        ]
                },
                {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        otype: "number",
                        required: false,
                        choices: []
                },
                {
                        name: "Test Rate",
                        attribute: "test_rate",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        otype: "string",
                        required: false,
                        choices: []
                },
                {
                        name: "Gage Length",
                        attribute: "gage_length",
                        description: "",
                        value: "",
                        units: ["mm", "cm"],
                        unit: "",
                        otype: "number",
                        required: false,
                        choices: []
                },
                {
                        name: "Sample Geometry",
                        attribute: "sample_geometry",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        otype: "selection",
                        required: false,
                        choices: [
                            {name: "Rectangular", value: "rectangular"},
                            {name: "Cylindrical", value: "cylindrical"}
                        ]
                }
            ]
        }
    ];
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
    Apt,
    Sem,
    CreateSamples,
    Sectioning,
    AptDataAnalysis,
    AptDataReconstruction,
    BroadIonBeamMilling,
    Cogging,
    Compression,
    Computation,
    Creep,
    DicPatterning,
    DicStatisticalModelling,
    Electropolishing,
    Etching,
    EbsdSemDataCollection,
    EpmaDataCollection,
    LowCycleFatigue,
    UltrasonicFatigue,
    TEM,
    HeatTreatment,
    AsMeasured,
    Hardness,
    XRD,
    Tension
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

