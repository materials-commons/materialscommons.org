function Apt() {
    this.settings = [
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
            property:{
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
            property:{
                name: "Voltage Pulse Fraction (%)",
                attribute: "voltage_pulse_fraction",
                description: "",
                value: null,
                units: [],
                unit:"percentage",
                _type: "number",
                required: false,
                choices: []
            },
            validators: [],
            valid: false,
            errorMessage: ""
        },
        {
            property:{
                name: "Laser Pulse Energy (pJ)",
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
            property:{
                name: "Laser Wavelength (nm)",
                attribute: "laser_wavelength",
                description: "",
                value: null,
                units: [],
                unit: "nm",
                _type: "selection",
                required: false,
                choices: []
            },
            validators: [],
            valid: false,
            errorMessage: ""
        },
        {
            property:{
                name: "Pulse Frequency (kHz)",
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
            property:{
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
                        "value" : "constant_detector_rate"
                    },
                    {
                        "name": "Constant Evaporation Rate",
                        "value" : "constant_evaporation_rate"
                    },
                    {
                        "name": "Constant Charge Rate Ratio",
                        "value" : "constant_charge_rate_ratio"
                    },
                    {
                        "name": "Other",
                        "value" : "other"
                    }
                ]
            },
            validators: [],
            valid: false,
            errorMessage: ""
        },
        {
            property:{
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
            property:{
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
                        "value" : "He"
                    },
                    {
                        "name": "Ar",
                        "value" : "Ar"
                    },
                    {
                        "name": "Ne",
                        "value" : "Ne"
                    },
                    {
                        "name": "Other",
                        "value" : "other"
                    },
                    {
                        "name": "None",
                        "value" : "none"
                    }
                ]
            },
            validators: [],
            valid: false,
            errorMessage: ""
        },
        {
            property:{
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
    ];
}
