export function Apt() {
    this.name = "APT";
    this.process_name = "APT";
    this.template_name = "APT";
    this.description = "Atom Probe Tomography";
    this._type = "APT";
    this.category = "APT";
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
                        value: null,
                        units: [],
                        unit: null,
                        _type: "selection",
                        required: true,
                        choices: [
                            {name: "FIM", value: "fim"},
                            {name: "Voltage", value: "voltage"},
                            {name: "Laser", value: "laser"}
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
                        units: ["K", "F", "C"],
                        unit: "",
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
                        unit: "",
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

export function Sem() {
    this.name = "SEM";
    this.process_name = "SEM";
    this.template_name = "SEM";
    this.description = "Stem Electron Microscopy";
    this._type = "SEM";
    this.category = "SEM";
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
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Secondary", "value": "secondary"},
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

export function CreateSamples() {
    this.name = "Create Samples";
    this.process_name = "Create Samples";
    this.template_name = "Create Samples";
    this.description = "Create Samples process is used to create new samples.";
    this._type = "create_samples";
    this.category = "create_samples";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
    this.samples = [];
    this.does_transform = false;
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Supplier",
                        attribute: "supplier",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                //{
                //    property: {
                //        name: "Dimensions",
                //        attribute: "dimensions",
                //        description: "",
                //        value: null,
                //        units: ["cm", "mm"],
                //        unit: "",
                //        _type: "string",
                //        required: false,
                //        choices: []
                //    },
                //    validators: [],
                //    valid: false,
                //    errorMessage: ""
                //},
                {
                    property: {
                        name: "Manufacturing Date",
                        attribute: "manufacturing_date",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "date",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Production method",
                        attribute: "production_method",
                        description: "",
                        value: null,
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

export function AptDataAnalysis() {
    this.name = "APT Data Analysis";
    this.process_name = "APT Data Analysis";
    this.template_name = "APT Data Analysis";
    this.description = "Atom Probe Tomography Data Analysis";
    this._type = "APT";
    this.category = "APT";
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
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
                        _type: "string",
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
                        _type: "string",
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
                        unit: "",
                        _type: "string",
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

export function AptDataReconstruction() {
    this.name = "APT Data Reconstruction";
    this.process_name = "APT Data Reconstruction";
    this.template_name = "APT Data Reconstruction";
    this.description = "Atom Probe Tomography Data Reconstruction";
    this._type = "APT";
    this.category = "APT";
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
                        value: null,
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
                        units: ["degrees", "rad"],
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

export function BroadIonBeamMilling() {
    this.name = "Broad Ion Beam Milling";
    this.process_name = "Broad Ion Beam Milling";
    this.template_name = "Broad Ion Beam Milling";
    this.description = "Broad Ion Beam Milling";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
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

export function Cogging() {
    this.name = "Cogging";
    this.process_name = "Cogging";
    this.template_name = "Cogging";
    this.description = "Cogging";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
                        units: ["C", "F", "K"],
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
                        name: "Strain",
                        attribute: "strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "percentage"],
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

export function Compression() {
    this.name = "Compression";
    this.process_name = "Compression";
    this.template_name = "Compression";
    this.description = "Compression";
    this._type = "OTHER";
    this.category = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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
                        value: null,
                        units: ["C", "F", "K"],
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
                        name: "True Strain",
                        attribute: "true_strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "percentage"],
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
                        name: "Engineering Strain",
                        attribute: "engineering_strain",
                        description: "",
                        value: null,
                        units: ["mm/mm", "percentage"],
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
                        units: ["mm/mm", "percentage"],
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

export function Computation() {
    this.name = "Computation";
    this.process_name = "Computation";
    this.template_name = "Computation";
    this.description = "Computation";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
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

export function Creep() {
    this.name = "Creep";
    this.process_name = "Creep";
    this.template_name = "Creep";
    this.description = "Creep";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
                        units: ["C", "F", "K"],
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
                        name: "Environment",
                        attribute: "environment",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
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

export function DicPatterning() {
    this.name = "DIC Patterning";
    this.process_name = "DIC Patterning";
    this.template_name = "DIC Patterning";
    this.description = "DIC Patterning";
    this._type = "DIC";
    this.category = "DIC";
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Large-Scale", "value": "large_scale"},
                            {"name": "Small-Scale", "value": "small_scale"}
                        ]
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
                        choices: [
                            {"name": "Alumina", "value": "alumina"},
                            {"name": "Gold", "value": "gold"}
                        ]
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
                        choices: [
                            {"name": "APTMS", "value": "aptms"},
                            {"name": "MPTMS", "value": "mptms"},
                            {"name": "N/A", "value": "n/a"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

export function DicStatisticalModelling() {
    this.name = "DIC Statistical Modelling";
    this.process_name = "DIC Statistical Modelling";
    this.template_name = "DIC Statistical Modelling";
    this.description = "DIC Statistical Modelling";
    this._type = "DIC";
    this.category = "DIC";
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
                        choices: [
                            {"name": "Linear", "value": "linear"},
                            {"name": "Interactions", "value": "interactions"},
                            {"name": "PureQuadratic", "value": "purequadratic"},
                            {"name": "Quadratic", "value": "quadratic"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                }
            ]
        }
    ];
}

export function Electropolishing() {
    this.name = "Electropolishing";
    this.process_name = "Electropolishing";
    this.template_name = "Electropolishing";
    this.description = "Electropolishing";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: null,
                        units: ["V", "kV"],
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
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: null,
                        units: ["mA", "A"],
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
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
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

export function Etching() {
    this.name = "Etching";
    this.process_name = "Etching";
    this.template_name = "Etching";
    this.description = "Etching";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Voltage",
                        attribute: "voltage",
                        description: "",
                        value: null,
                        units: ["V", "kV"],
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
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: null,
                        units: ["hrs", "mins", "s"],
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
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
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

export function EbsdSemDataCollection() {
    this.name = "EBSD SEM Data Collection";
    this.process_name = "EBSD SEM Data Collection";
    this.template_name = "EBSD SEM Data Collection";
    this.description = "EBSD SEM Data Collection";
    this._type = "SEM";
    this.category = "SEM";
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
                        value: null,
                        units: ["kv", "V"],
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
                        name: "Current",
                        attribute: "current",
                        description: "",
                        value: null,
                        units: ["A", "mA"],
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
                        name: "Sample Tilt",
                        attribute: "sample_tilt",
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
                        name: "Magnification",
                        attribute: "magnification",
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
                        name: "Acquisition Time",
                        attribute: "acquisition_time",
                        description: "",
                        value: null,
                        units: ["s", "ms"],
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
                        name: "Scan Size",
                        attribute: "scan_size",
                        description: "",
                        value: null,
                        units: ["microns"],
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
                        name: "Step Size",
                        attribute: "step_size",
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
                        name: "Working Distance",
                        attribute: "working_distance",
                        description: "",
                        value: null,
                        units: [],
                        unit: "mm",
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

export function EpmaDataCollection() {
    this.name = "EPMA Data Collection";
    this.process_name = "EPMA Data Collection";
    this.template_name = "EPMA Data Collection";
    this.description = "EPMA Data Collection";
    this._type = "EPMA";
    this.category = "EPMA";
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
                        value: null,
                        units: ["kv", "V"],
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
                        name: "Beam Current",
                        attribute: "beam_current",
                        description: "",
                        value: null,
                        units: ["A", "nA"],
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
                        name: "Beam Size",
                        attribute: "beam_size",
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
                        name: "Scan Type",
                        attribute: "scan_type",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Line", "value": "line"},
                            {"name": "Grid", "value": "grid"},
                            {"name": "Point", "value": "point"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Step Size",
                        attribute: "step_size",
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
                        name: "Grid Dimensions",
                        attribute: "grid_dimensions",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Location",
                        attribute: "location",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
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

export function LowCycleFatigue() {
    this.name = "Low Cycle Fatigue";
    this.process_name = "Low Cycle Fatigue";
    this.template_name = "Low Cycle Fatigue";
    this.description = "Low Cycle Fatigue";
    this._type = "OTHER";
    this.category = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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
                        value: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Temperature",
                        attribute: "temperature",
                        description: "",
                        value: null,
                        units: ["K", "F", "C"],
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
                        name: "Frequency",
                        attribute: "frequency",
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
                        name: "Wave Form",
                        attribute: "wave_form",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Continuous", "value": "continuous"},
                            {"name": "Interrupted( with hold times)", "value": "interrupted"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Wave Form Shape",
                        attribute: "wave_form_shape",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Sinusoidal", "value": "sinusoidal"},
                            {"name": "Rectangular", "value": "rectangular"},
                            {"name": "Triangular", "value": "triangular"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Amplitude",
                        attribute: "amplitude",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Constant", "value": "constant"},
                            {"name": "Variable", "value": "variable"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Load Ratio",
                        attribute: "load_ratio",
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
                        name: "Manufacturer",
                        attribute: "manufacturer",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Strain Limits",
                        attribute: "strain_limits",
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
                }
            ]
        }
    ];
}

export function UltrasonicFatigue() {
    this.name = "Ultrasonic Fatigue";
    this.process_name = "Ultrasonic Fatigue";
    this.template_name = "Ultrasonic Fatigue";
    this.description = "Ultrasonic Fatigue";
    this._type = "OTHER";
    this.category = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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
                        name: "Power Control",
                        attribute: "power_control",
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
                        name: "Resonating Frequency",
                        attribute: "resonating_frequency",
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
                        name: "Calibration Constant",
                        attribute: "calibration_constant",
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
                        name: "Stress Ratio",
                        attribute: "stress_ratio",
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
                        name: "Max Stress",
                        attribute: "max_stress",
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
                },
                {
                    property: {
                        name: "Test Temperature",
                        attribute: "test_temperature",
                        description: "",
                        value: null,
                        units: ["C", "F", "K"],
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
                        name: "Test Environment",
                        attribute: "test_environment",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
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

export function TEM() {
    this.name = "TEM";
    this.process_name = "TEM";
    this.template_name = "TEM";
    this.description = "Transmission Electron Microscope";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        name: "Mode",
                        attribute: "mode",
                        description: "",
                        value: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Conventional Scanning",
                        attribute: "conventional_scanning",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Yes", "value": "yes"},
                            {"name": "No", "value": "no"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Scanning",
                        attribute: "scanning",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "selection",
                        required: false,
                        choices: [
                            {"name": "Bright Field", "value": "bright_field"},
                            {"name": "High Angle Angular Dark Field", "value": "high_angle_angular_dark_field"},
                            {"name": "Tilt Series", "value": "tilt_series"}
                        ]
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Stage",
                        attribute: "stage",
                        description: "",
                        value: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Apparatus",
                        attribute: "apparatus",
                        description: "",
                        value: null,
                        units: [],
                        unit: "",
                        _type: "string",
                        required: false,
                        choices: []
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Spot Size",
                        attribute: "spot_size",
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
                        name: "Camera Length",
                        attribute: "camera_length",
                        description: "",
                        value: null,
                        units: ["cm", "mm", "m"],
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

export function HeatTreatment() {
    this.name = "Heat Treatment";
    this.process_name = "Heat Treatment";
    this.template_name = "Heat Treatment";
    this.description = "HeatTreatment";
    this._type = "OTHER";
    this.category = "OTHER";
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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
                        value: null,
                        units: ["K", "F", "C"],
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
                        name: "Time",
                        attribute: "time",
                        description: "",
                        value: null,
                        units: ["seconds", "minutes", "hours"],
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
                        name: "Cooling Type",
                        attribute: "cooling_type",
                        description: "",
                        value: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Cooling Rate",
                        attribute: "cooling_rate",
                        description: "",
                        value: null,
                        units: ["C/s", "K/s"],
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

export function XRD() {
    this.name = "XRD";
    this.process_name = "XRD";
    this.description = "XRD";
    this.category = "OTHER";
    this.template_name = "XRD";
    this.does_transform = true;
    this.measurements = [];
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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

export function Tension() {
    this.name = "Tension";
    this.process_name = "Tension";
    this.description = "Tension";
    this.template_name = "Tension";
    this.category = "OTHER";
    this.does_transform = true;
    this.measurements = [];
    this.input_files = [];
    this.output_files = [];
    this.input_samples = [];
    this.output_samples = [];
    this.transformed_samples = [];
    this.project_id = "";
    this.what = "";
    this.why = "";
    this.owner = "";
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

export function AsMeasured() {
    this.name = "As Measured";
    this.process_name = "As Measured";
    this.template_name = "As Measured";
    this.description = "As Measured process allows you to add in all your As Received measurements";
    this._type = "OTHER";
    this.category = "OTHER";
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
    this.measurements = [];
    this.setup = [
        {
            name: "Instrument",
            attribute: "instrument",
            properties: []
        }
    ];
}

export function Hardness1() {
    this.name = "Hardness";
    this.process_name = "Hardness";
    this.template_name = "Hardness";
    this.description = "Hardness";
    this._type = "OTHER";
    this.category = "OTHER";
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
                        value: null,
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
                    },
                    validators: [],
                    valid: false,
                    errorMessage: ""
                },
                {
                    property: {
                        name: "Load",
                        attribute: "load",
                        description: "",
                        value: null,
                        units: ["ibf", "N"],
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
                        name: "Dwell Time",
                        attribute: "dwell_time",
                        description: "",
                        value: null,
                        units: ["seconds", "minutes", "hours"],
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
