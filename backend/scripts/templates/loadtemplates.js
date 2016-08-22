#!/usr/bin/env node

function Apt() {
    this.name = "APT";
    this.process_name = "APT";
    this.description = "Atom Probe Tomography";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Mode",
                        attribute: "mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: true,
                        choices: [
                            {name: "FIM", value: "fim"},
                            {name: "Voltage", value: "voltage"},
                            {name: "Laser", value: "laser"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Specimen Temperature",
                        attribute: "specimen_temperature",
                        description: "",
                        value: "",
                        units: ["K", "F", "C"],
                        unit: "",
                        _type: "number",
                        required: true,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Voltage Pulse Fraction",
                        attribute: "voltage_pulse_fraction",
                        description: "",
                        value: "",
                        units: [],
                        unit: "percentage",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Laser Pulse Energy",
                        attribute: "laser_pulse_energy",
                        description: "",
                        value: "",
                        units: ["pJ", "nJ"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Laser Wavelength",
                        attribute: "laser_wavelength",
                        description: "",
                        value: "",
                        units: [],
                        unit: "nm",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Pulse Frequency",
                        attribute: "pulse_frequency",
                        description: "",
                        value: "",
                        units: [],
                        unit: "kHz",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Evaporation Control",
                        attribute: "evaporation_control",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {
                                "name": "Constant Detector Rate",
                                "value": "constant_detector_rate"
                            },
                            {
                                "name": "Constant Evaporation Rate",
                                "value": "constant_evaporation_rate"
                            },
                            {
                                "name": "Constant Charge Rate Ratio",
                                "value": "constant_charge_rate_ratio"
                            },
                            {
                                "name": "Other",
                                "value": "other"
                            }
                        ]
                    }
                },
                {
                    property: {
                        name: "Evaporation Rate",
                        attribute: "evaporation_rate",
                        description: "",
                        value: "",
                        units: [],
                        unit: "Atom/Pulse",
                        required: false,
                        _type: "number",
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Imaging Gas",
                        attribute: "imaging_gas",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        required: false,
                        _type: "selection",
                        choices: [
                            {"name": "He", "value": "He"},
                            {"name": "Ar", "value": "Ar"},
                            {"name": "Ne", "value": "Ne"},
                            {"name": "Other", "value": "other"},
                            {"name": "None", "value": "none"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Pressure",
                        attribute: "pressure",
                        description: "",
                        value: "",
                        units: ["atm", "Pa", "torr"],
                        unit: "",
                        required: false,
                        _type: "number",
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Sem() {
    this.name = "SEM";
    this.process_name = "SEM";
    this.description = "Stem Electron Microscopy";
    this.category = "SEM";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: [],
                        unit: "kV",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: "",
                        units: [],
                        unit: "A",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Stage Tilt",
                        attribute: "stage_tilt",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        "name": "Magnification",
                        "attribute": "magnification",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        "name": "Specimen/Stage Bias",
                        "attribute": "specimen_stage_bias",
                        description: "",
                        value: "",
                        units: [],
                        unit: "V",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        "name": "Stage",
                        "attribute": "stage",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Standard", "value": "standard"},
                            {"name": "Cryo", "value": "cryo"}
                        ]
                    }
                },
                {
                    property: {
                        "name": "Detector",
                        "attribute": "detector",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Secondary", "value": "secondary"},
                            {"name": "Backscattered", "value": "backscattered"},
                            {"name": "Other", "value": "other"}
                        ]
                    }
                },
                {
                    property: {
                        "name": "Working Distance",
                        "attribute": "working_distance",
                        description: "",
                        value: "",
                        units: [],
                        unit: "mm",
                        required: false,
                        _type: "number",
                        choices: []
                    }
                }
            ]
        }
    ];
}

function CreateSamples() {
    this.name = "Create Samples";
    this.process_name = "Create Samples";
    this.description = "Create Sample process is used to create new samples.";
    this.category = "create_sample";
    this.does_transform = true;
    this.measurements = [
        {
            property: {
                name: "Composition",
                attribute: "composition",
                description: "",
                value: [],
                units: [],
                unit: "at%",
                _type: "composition",
                required: false,
                choices: []
            }
        }
    ];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Manufacturer",
                        attribute: "manufacturer",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Supplier",
                        attribute: "supplier",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                //{
                //    property: {
                //        name: "Dimensions",
                //        attribute: "dimensions",
                //        description: "",
                //        value: "",
                //        units: ["cm", "mm"],
                //        unit: "",
                //        _type: "string",
                //        required: false,
                //        choices: []
                //    }
                //},
                {
                    property: {
                        name: "Manufacturing Date",
                        attribute: "manufacturing_date",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "date",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Production method",
                        attribute: "production_method",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {name: "Cast", value: "cast"},
                            {name: "Extruded", value: "extruded"},
                            {name: "Rolled", value: "rolled"},
                            {name: "Unknown", value: "unknown"},
                            {name: "Other", value: "other"}
                        ]
                    }
                }
            ]
        }
    ]
}

function AptDataAnalysis() {
    this.name = "APT Data Analysis";
    this.process_name = "APT Data Analysis";
    this.description = "Atom Probe Tomography Data Analysis";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "System Information",
            attribute: "system_information",
            properties: [
                {
                    property: {
                        name: "Software",
                        attribute: "software",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Software URL",
                        attribute: "software_url",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Software Version",
                        attribute: "software_version",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "How to Cite",
                        attribute: "how_to_cite",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function AptDataReconstruction() {
    this.name = "APT Data Reconstruction";
    this.process_name = "APT Data Reconstruction";
    this.description = "Atom Probe Tomography Data Reconstruction";
    this.category = "APT";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Reconstruction Mode",
                        attribute: "reconstruction_mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Voltage", "value": "voltage"},
                            {"name": "Shank Angle", "value": "shank_angle"},
                            {"name": "Tip Image", "value": "tip_image"},
                            {"name": "Other", "value": "other"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Field Factor",
                        attribute: "field_factor",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Image Compression Factor",
                        attribute: "image_compression_factor",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Evaporation Field",
                        attribute: "evaporation_field",
                        description: "",
                        value: "",
                        units: [],
                        unit: 'V/nm',
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Detection Efficiency",
                        attribute: "detection_efficiency",
                        description: "",
                        value: "",
                        units: [],
                        unit: "percentage",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Initial Radius",
                        attribute: "initial_radius",
                        description: "",
                        value: "",
                        units: [],
                        unit: "nm",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Shank Angle",
                        attribute: "shank_angle",
                        description: "",
                        value: "",
                        units: ["degrees", "rad"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Cone to Sphere Ratio",
                        attribute: "cone_to_sphere_ratio",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function BroadIonBeamMilling() {
    this.name = "Broad Ion Beam Milling";
    this.process_name = "Broad Ion Beam Milling";
    this.description = "Broad Ion Beam Milling";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Ion Type",
                        attribute: "ion_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Ga", "value": "Ga"},
                            {"name": "Ne", "value": "Ne"},
                            {"name": "Ar", "value": "Ar"},
                            {"name": "Other", "value": "other"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Energy",
                        attribute: "energy",
                        description: "",
                        value: "",
                        units: [],
                        unit: "V",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: "",
                        units: [],
                        unit: "s",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Cogging() {
    this.name = "Cogging";
    this.process_name = "Cogging";
    this.description = "Cogging";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Strain",
                        attribute: "strain",
                        description: "",
                        value: "",
                        units: ["mm/mm", "percentage"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Compression() {
    this.name = "Compression";
    this.process_name = "Compression";
    this.description = "Compression";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "True Strain",
                        attribute: "true_strain",
                        description: "",
                        value: "",
                        units: ["mm/mm", "percentage"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Engineering Strain",
                        attribute: "engineering_strain",
                        description: "",
                        value: "",
                        units: ["mm/mm", "percentage"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Strain Rate",
                        attribute: "strain_rate",
                        description: "",
                        value: "",
                        units: ["1/s", "mm/min"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Target Total Strain",
                        attribute: "target_total_strain",
                        description: "",
                        value: "",
                        units: ["mm/mm", "percentage"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Load Rate",
                        attribute: "load_rate",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Computation() {
    this.name = "Computation";
    this.process_name = "Computation";
    this.description = "Computation";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Job Settings",
            attribute: "job_settings",
            properties: [
                {
                    property: {
                        name: "Submit Script",
                        attribute: "submit_script",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Number of Processors",
                        attribute: "number_of_processors",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Memory per Processor",
                        attribute: "memory_per_processor",
                        description: "",
                        value: "",
                        units: ["b", "kb", "mb", "gb"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Walltime",
                        attribute: "walltime",
                        description: "",
                        value: "",
                        units: [],
                        unit: "s",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Creep() {
    this.name = "Creep";
    this.process_name = "Creep";
    this.description = "Creep";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Environment",
                        attribute: "environment",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Stress",
                        attribute: "stress",
                        description: "",
                        value: "",
                        units: [],
                        unit: "MPa",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function DicPatterning() {
    this.name = "DIC Patterning";
    this.process_name = "DIC Patterning";
    this.description = "DIC Patterning";
    this.category = "DIC";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Scale",
                        attribute: "scale",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Large-Scale", "value": "large_scale"},
                            {"name": "Small-Scale", "value": "small_scale"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Field of View",
                        attribute: "field_of_view",
                        description: "",
                        value: "",
                        units: [],
                        unit: "microns",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Particle Size",
                        attribute: "particle_size",
                        description: "",
                        value: "",
                        units: ["microns", "nm"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Particle Type",
                        attribute: "particle_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Alumina", "value": "alumina"},
                            {"name": "Gold", "value": "gold"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Silane Type",
                        attribute: "silane_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "APTMS", "value": "aptms"},
                            {"name": "MPTMS", "value": "mptms"},
                            {"name": "N/A", "value": "n/a"}
                        ]
                    }
                }
            ]
        }
    ];
}

function DicStatisticalModelling() {
    this.name = "DIC Statistical Modelling";
    this.process_name = "DIC Statistical Modelling";
    this.description = "DIC Statistical Modelling";
    this.category = "DIC";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Number of Parameters",
                        attribute: "number_of_parameters",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Number of Observations",
                        attribute: "number_of_observations",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Model Type",
                        attribute: "model_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Linear", "value": "linear"},
                            {"name": "Interactions", "value": "interactions"},
                            {"name": "PureQuadratic", "value": "purequadratic"},
                            {"name": "Quadratic", "value": "quadratic"}
                        ]
                    }
                }
            ]
        }
    ];
}

function Electropolishing() {
    this.name = "Electropolishing";
    this.process_name = "Electropolishing";
    this.description = "Electropolishing";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Solution",
                        attribute: "solution",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: ["V", "kV"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: "",
                        units: ["mA", "A"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Etching() {
    this.name = "Etching";
    this.process_name = "Etching";
    this.description = "Etching";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Solution",
                        attribute: "solution",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: ["V", "kV"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: "",
                        units: ["hrs", "mins", "s"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function EbsdSemDataCollection() {
    this.name = "EBSD SEM Data Collection";
    this.process_name = "EBSD SEM Data Collection";
    this.description = "EBSD SEM Data Collection";
    this.category = "SEM";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: ["kv", "V"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: "",
                        units: ["A", "mA"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Sample Tilt",
                        attribute: "sample_tilt",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Magnification",
                        attribute: "magnification",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Acquisition Time",
                        attribute: "acquisition_time",
                        description: "",
                        value: "",
                        units: ["s", "ms"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Scan Size",
                        attribute: "scan_size",
                        description: "",
                        value: "",
                        units: ["microns"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Step Size",
                        attribute: "step_size",
                        description: "",
                        value: "",
                        units: [],
                        unit: "microns",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Working Distance",
                        attribute: "working_distance",
                        description: "",
                        value: "",
                        units: [],
                        unit: "mm",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function EpmaDataCollection() {
    this.name = "EPMA Data Collection";
    this.process_name = "EPMA Data Collection";
    this.description = "EPMA Data Collection";
    this.category = "EPMA";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: ["kv", "V"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Beam Current",
                        attribute: "beam_current",
                        description: "",
                        value: "",
                        units: ["A", "nA"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Beam Size",
                        attribute: "beam_size",
                        description: "",
                        value: "",
                        units: [],
                        unit: "microns",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Scan Type",
                        attribute: "scan_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Line", "value": "line"},
                            {"name": "Grid", "value": "grid"},
                            {"name": "Point", "value": "point"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Step Size",
                        attribute: "step_size",
                        description: "",
                        value: "",
                        units: [],
                        unit: "microns",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Grid Dimensions",
                        attribute: "grid_dimensions",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Location",
                        attribute: "location",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function LowCycleFatigue() {
    this.name = "Low Cycle Fatigue";
    this.process_name = "Low Cycle Fatigue";
    this.description = "Low Cycle Fatigue";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Mode",
                        attribute: "mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Total strain control", "value": "total_strain_control"},
                            {"name": "Plastic strain control", "value": "plastic_strain_control"},
                            {"name": "Stress control", "value": "stress_control"},
                            {"name": "Displacement control", "value": "displacement_control"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["K", "F", "C"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Frequency",
                        attribute: "frequency",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Wave Form",
                        attribute: "wave_form",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Continuous", "value": "continuous"},
                            {"name": "Interrupted( with hold times)", "value": "interrupted"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Wave Form Shape",
                        attribute: "wave_form_shape",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Sinusoidal", "value": "sinusoidal"},
                            {"name": "Rectangular", "value": "rectangular"},
                            {"name": "Triangular", "value": "triangular"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Amplitude",
                        attribute: "amplitude",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Constant", "value": "constant"},
                            {"name": "Variable", "value": "variable"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Load Ratio",
                        attribute: "load_ratio",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Manufacturer",
                        attribute: "manufacturer",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Strain Limits",
                        attribute: "strain_limits",
                        description: "",
                        value: "",
                        units: [],
                        unit: "percentage",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function UltrasonicFatigue() {
    this.name = "Ultrasonic Fatigue";
    this.process_name = "Ultrasonic Fatigue";
    this.description = "Ultrasonic Fatigue";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Amplifiers (count)",
                        attribute: "amplifier_count",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Power Control",
                        attribute: "power_control",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Resonating Frequency",
                        attribute: "resonating_frequency",
                        description: "",
                        value: "",
                        units: [],
                        unit: "kHz",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Calibration Constant",
                        attribute: "calibration_constant",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Stress Ratio",
                        attribute: "stress_ratio",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Max Stress",
                        attribute: "max_stress",
                        description: "",
                        value: "",
                        units: [],
                        unit: "MPa",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Test Temperature",
                        attribute: "test_temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Test Environment",
                        attribute: "test_environment",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function TEM() {
    this.name = "TEM";
    this.process_name = "TEM";
    this.description = "Transmission Electron Microscope";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Mode",
                        attribute: "mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Diffraction", "value": "diffraction"},
                            {"name": "Diffraction Imaging", "value": "diffraction_imaging"},
                            {"name": "High Resolution Imaging", "value": "high_resolution_imaging"},
                            {"name": "Scanning z-contrast", "value": "scanning_z_contrast"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Conventional Scanning",
                        attribute: "conventional_scanning",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Yes", "value": "yes"},
                            {"name": "No", "value": "no"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Scanning",
                        attribute: "scanning",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Bright Field", "value": "bright_field"},
                            {"name": "High Angle Angular Dark Field", "value": "high_angle_angular_dark_field"},
                            {"name": "Tilt Series", "value": "tilt_series"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Stage",
                        attribute: "stage",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Standard", "value": "standard"},
                            {"name": "Cryo", "value": "cryo"},
                            {"name": "Heating", "value": "heating"},
                            {"name": "Other", "value": "other"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Apparatus",
                        attribute: "apparatus",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Spot Size",
                        attribute: "spot_size",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Camera Length",
                        attribute: "camera_length",
                        description: "",
                        value: "",
                        units: ["cm", "mm", "m"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function HeatTreatment() {
    this.name = "Heat Treatment";
    this.process_name = "Heat Treatment";
    this.description = "HeatTreatment";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["K", "F", "C"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: "",
                        units: ["seconds", "minutes", "hours"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Cooling Type",
                        attribute: "cooling_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Air Quench", "value": "air_quench"},
                            {"name": "Water Quench", "value": "water_quench"},
                            {"name": "Furnace Cooled", "value": "furnace_cooled"},
                            {"name": "Air Cooled", "value": "air_cooled"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Cooling Rate",
                        attribute: "cooling_rate",
                        description: "",
                        value: "",
                        units: ["C/s", "K/s"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function AsMeasured() {
    this.name = "As Measured";
    this.process_name = "As Measured";
    this.description = "As Measured process allows you to add in all your As Received measurements";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
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
    this.description = "Hardness";
    this.category = "OTHER";
    this.does_transform = false;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Type",
                        attribute: "type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Vickers", "value": "vickers"},
                            {"name": "Rockwell A", "value": "rockwell_a"},
                            {"name": "Rockwell B", "value": "rockwell_b"},
                            {"name": "Rockwell C", "value": "rockwell_c"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Load",
                        attribute: "load",
                        description: "",
                        value: "",
                        units: ["ibf", "N"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Dwell Time",
                        attribute: "dwell_time",
                        description: "",
                        value: "",
                        units: ["seconds", "minutes", "hours"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function XRD() {
    this.name = "XRD";
    this.process_name = "XRD";
    this.description = "XRD";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Type",
                        attribute: "type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Start Angle",
                        attribute: "start_angle",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "End Angle",
                        attribute: "end_angle",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Rate",
                        attribute: "rate",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees/minute",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Step Size",
                        attribute: "step_size",
                        description: "",
                        value: "",
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                }
            ]
        }
    ];
}

function Tension() {
    this.name = "Tension";
    this.process_name = "Tension";
    this.description = "Tension";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Force type",
                        attribute: "force_type",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {name: "Screw", value: "screw"},
                            {name: "Hydraulic", value: "hydraulic"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Control Mode",
                        attribute: "control_mode",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {name: "Displacement", value: "displacement"},
                            {name: "Force", value: "force"},
                            {name: "Strain", value: "strain"}
                        ]
                    }
                },
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: "",
                        units: ["C", "F", "K"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Test Rate",
                        attribute: "test_rate",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Gage Length",
                        attribute: "gage_length",
                        description: "",
                        value: "",
                        units: ["mm", "cm"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    }
                },
                {
                    property: {
                        name: "Sample Geometry",
                        attribute: "sample_geometry",
                        description: "",
                        value: "",
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {name: "Rectangular", value: "rectangular"},
                            {name: "Cylindrical", value: "cylindrical"}
                        ]
                    }
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

