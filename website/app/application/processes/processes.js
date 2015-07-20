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
                        unit: "°",
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
        settings: []
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

