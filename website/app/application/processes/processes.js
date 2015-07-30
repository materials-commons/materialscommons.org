function Apt() {
    this.name = "APT";
    this.description = "Atom Probe Tomography";
    this._type = "APT";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Mode",
                        attribute: "mode",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: true,
                        choices: [
                            {
                                name: "FIM",
                                value: "fim"
                            },
                            {
                                name: "Voltage",
                                value: "voltage"
                            },
                            {
                                name: "Laser",
                                value: "laser"
                            }
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Specimen Temperature",
                        attribute: "specimen_temperature",
                        description: "",
                        value: null,
                        units: [],
                        unit: "K",
                        _type: "number",
                        required: true,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Voltage Pulse Fraction",
                        attribute: "voltage_pulse_fraction",
                        description: "",
                        value: null,
                        units: [],
                        unit: "percentage",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Laser Pulse Energy",
                        attribute: "laser_pulse_energy",
                        description: "",
                        value: null,
                        units: ["pJ", "nJ"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Laser Wavelength",
                        attribute: "laser_wavelength",
                        description: "",
                        value: null,
                        units: [],
                        unit: "nm",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Pulse Frequency",
                        attribute: "pulse_frequency",
                        description: "",
                        value: null,
                        units: [],
                        unit: "kHz",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Evaporation Control",
                        attribute: "evaporation_control",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Evaporation Rate",
                        attribute: "evaporation_rate",
                        description: "",
                        value: null,
                        units: [],
                        unit: "Atom/Pulse",
                        required: false,
                        _type: "number",
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Imaging Gas",
                        attribute: "imaging_gas",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        required: false,
                        _type: "selection",
                        choices: [
                            {
                                "name": "He",
                                "value": "He"
                            },
                            {
                                "name": "Ar",
                                "value": "Ar"
                            },
                            {
                                "name": "Ne",
                                "value": "Ne"
                            },
                            {
                                "name": "Other",
                                "value": "other"
                            },
                            {
                                "name": "None",
                                "value": "none"
                            }
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Pressure",
                        attribute: "pressure",
                        description: "",
                        value: null,
                        units: ["atm", "Pa", "torr"],
                        unit: null,
                        required: false,
                        _type: "number",
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function Sem() {
    this.name = "SEM";
    this.description = "Stem Electron Microscopy";
    this._type = "SEM";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: null,
                        units: [],
                        unit: "kV",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: null,
                        units: [],
                        unit: "A",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Stage Tilt",
                        attribute: "stage_tilt",
                        description: "",
                        value: null,
                        units: [],
                        unit: "degrees",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        "name": "Magnification",
                        "attribute": "magnification",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        "name": "Specimen/Stage Bias",
                        "attribute": "specimen_stage_bias",
                        description: "",
                        value: null,
                        units: [],
                        unit: "V",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        "name": "Stage",
                        "attribute": "stage",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Standard", "value": "standard"},
                            {"name": "Cryo", "value": "cryo"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        "name": "Detector",
                        "attribute": "detector",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Secondary", "value": "secondary"},
                            {"name": "Backscattered", "value": "backscattered"},
                            {"name": "Other", "value": "other"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        "name": "Working Distance",
                        "attribute": "working_distance",
                        description: "",
                        value: null,
                        units: [],
                        unit: "mm",
                        required: false,
                        _type: "number",
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function AsReceived() {
    this.name = "As Received";
    this.description = "As Received process is used to create new samples.";
    this._type = "as_received";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.does_transform = false;
    this.setup = {
        files: [],
        settings: [{
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Manufacturer",
                        attribute: "manufacturer",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }]
        }]
    };
}

function AptDataAnalysis() {
    this.name = "APT Data Analysis";
    this.description = "Atom Probe Tomography Data Analysis";
    this._type = "APT";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "System Information",
            attribute: "system_information",
            properties: [
                {
                    property: {
                        name: "Software",
                        attribute: "software",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Software URL",
                        attribute: "software_url",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Software Version",
                        attribute: "software_version",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "How to Cite",
                        attribute: "how_to_cite",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function AptDataReconstruction() {
    this.name = "APT Data Reconstruction";
    this.description = "Atom Probe Tomography Data Reconstruction";
    this._type = "APT";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Reconstruction Mode",
                        attribute: "reconstruction_mode",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Voltage", "value": "voltage"}, {
                            "name": "Shank Angle",
                            "value": "shank_angle"
                        },
                            {"name": "Tip Image", "value": "tip_image"}, {"name": "Other", "value": "other"}]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Field Factor",
                        attribute: "field_factor",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Image Compression Factor",
                        attribute: "image_compression_factor",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Evaporation Field",
                        attribute: "evaporation_field",
                        description: "",
                        value: null,
                        units: [],
                        unit: 'V/nm',
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Detection Efficiency",
                        attribute: "detection_efficiency",
                        description: "",
                        value: null,
                        units: [],
                        unit: "%",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Initial Radius",
                        attribute: "initial_radius",
                        description: "",
                        value: null,
                        units: [],
                        unit: "nm",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Shank Angle",
                        attribute: "shank_angle",
                        description: "",
                        value: null,
                        units: ["°", "rad"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Cone to Sphere Ratio",
                        attribute: "cone_to_sphere_ratio",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function BroadIonBeamMilling() {
    this.name = "Broad Ion Beam Milling";
    this.description = "Broad Ion Beam Milling";
    this._type = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "emarq@umich.edu";
    this.does_transform = true;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Ion Type",
                        attribute: "ion_type",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Ga", "value": "Ga"}, {"name": "Ne", "value": "Ne"}, {
                            "name": "Ar",
                            "value": "Ar"
                        }, {"name": "Other", "value": "other"}]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Energy",
                        attribute: "energy",
                        description: "",
                        value: null,
                        units: [],
                        unit: "V",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: null,
                        units: [],
                        unit: "s",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function Cogging() {
    this.name = "Cogging";
    this.description = "Cogging";
    this._type = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "jfadams@umich.edu";
    this.does_transform = true;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Strain",
                        attribute: "strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "%"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function Compression() {
    this.name = "Compression";
    this.description = "Compression";
    this._type = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "emarq@umich.edu";
    this.does_transform = true;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Strain",
                        attribute: "strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "%"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Strain Rate",
                        attribute: "strain_rate",
                        description: "",
                        value: null,
                        units: ["1/s", "mm/min"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Target Total Strain",
                        attribute: "target_total_strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "%"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Load Rate",
                        attribute: "load_rate",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function Computation() {
    this.name = "Computation";
    this.description = "Computation";
    this._type = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "bpuchala@umich.edu";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Job Settings",
            attribute: "job_settings",
            properties: [
                {
                    property: {
                        name: "Submit Script",
                        attribute: "submit_script",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Number of Processors",
                        attribute: "number_of_processors",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Memory per Processor",
                        attribute: "memory_per_processor",
                        description: "",
                        value: null,
                        units: ["b", "kb", "mb", "gb"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Walltime",
                        attribute: "walltime",
                        description: "",
                        value: null,
                        units: [],
                        unit: "s",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function Creep() {
    this.name = "Creep";
    this.description = "Creep";
    this._type = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "emarq@umich.edu";
    this.does_transform = true;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Environment",
                        attribute: "environment",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "text",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Stress",
                        attribute: "stress",
                        description: "",
                        value: null,
                        units: [],
                        unit: "MPa",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function DicPatterning() {
    this.name = "DIC Patterning";
    this.description = "DIC Patterning";
    this._type = "DIC";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "agithens@umich.edu";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Scale",
                        attribute: "scale",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Large-Scale", "value": "large_scale"}, {
                            "name": "Small-Scale",
                            "value": "small_scale"
                        }]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Field of View",
                        attribute: "field_of_view",
                        description: "",
                        value: null,
                        units: [],
                        unit: "microns",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Particle Size",
                        attribute: "particle_size",
                        description: "",
                        value: null,
                        units: ["microns", "nm"],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Particle Type",
                        attribute: "particle_type",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Alumina", "value": "alumina"}, {"name": "Gold", "value": "gold"}]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Silane Type",
                        attribute: "silane_type",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [{"name": "APTMS", "value": "aptms"}, {
                            "name": "MPTMS",
                            "value": "mptms"
                        }, {"name": "N/A", "value": "n/a"}]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

function DicStatisticalModelling() {
    this.name = "DIC Statistical Modelling";
    this.description = "DIC Statistical Modelling";
    this._type = "DIC";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "agithens@umich.edu";
    this.does_transform = false;
    this.setup = {
        files: []
    };
    this.setup.settings = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: [
                {
                    property: {
                        name: "Number of Parameters",
                        attribute: "number_of_parameters",
                        description: "",
                        value: null,
                        units: [],
                        unit: null,
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Number of Observations",
                        attribute: "number_of_observations",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "number",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Model Type",
                        attribute: "model_type",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [{"name": "Linear", "value" : "linear"},
                            {"name": "Interactions", "value" : "interactions"},
                            {"name": "PureQuadratic", "value" : "purequadratic"},
                            {"name": "Quadratic", "value" : "quadratic"}]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

