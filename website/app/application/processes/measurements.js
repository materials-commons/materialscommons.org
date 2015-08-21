function Composition() {
    this.property = {
        name: "Composition",
        attribute: "composition",
        description: "Composition of sample",
        _type: "composition",
        _category: "scalar",
        units: ["at%", "wt%"],
        nunit: "at%",
        unit: null,
        value: null,
        element: ""
    };

    this.validators = [];
}

function AreaFraction() {
    this.property = {
        name: "Area Fraction",
        attribute: "area_fraction",
        description: "",
        _type: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function VolumeFraction() {
    this.property = {
        name: "Volume Fraction",
        attribute: "volume_fraction",
        description: "",
        _type: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };

    this.validators = [];
}

function DislocationDensity() {
    this.property = {
        name: "Dislocation Density",
        attribute: "dislocation_density",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "m^-2",
        unit: "m^-2",
        value: null
    };

    this.validators = [];
}

function Length() {
    this.property = {
        name: "Length",
        attribute: "length",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };

    this.validators = [];
}

function Width() {
    this.property = {
        name: "Width",
        attribute: "width",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };
    this.validators = [];
}

function Height() {
    this.property = {
        name: "Height",
        attribute: "height",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };
    this.validators = [];
}

function Density() {
    this.property = {
        name: "Density",
        attribute: "density",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "kg/m^3",
        unit: "kg/m^3",
        value: null
    };
    this.validators = [];
}

function Volume() {
    this.property = {
        name: "Volume",
        attribute: "volume",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "m^3",
        unit: "m^3",
        value: null
    };
    this.validators = [];
}

function YoungsModulus() {
    this.property = {
        name: "Young's modulus",
        attribute: "youngs_modulus",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

function TensileYieldStrength() {
    this.property = {
        name: "Tensile Yield Strength",
        attribute: "tensile_yield_strength",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

function UltimateTensileStrength() {
    this.property = {
        name: "Ultimate Tensile Strength",
        attribute: "ultimate_tensile_strength",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

function StrainToFracture() {
    this.property = {
        name: "Strain To Fracture",
        attribute: "strain_to_fracture",
        description: "",
        _type: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function SpaceGroup() {
    this.property = {
        name: "Space Group",
        attribute: "space_group",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function PointGroup() {
    this.property = {
        name: "Point Group",
        attribute: "point_group",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function CrystalSystem() {
    this.property = {
        name: "Crystal System",
        attribute: "crystal_system",
        description: "",
        _type: "string",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function BandGap() {
    this.property = {
        name: "Band Gap",
        attribute: "band_gap",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function FatigueLife() {
    this.property = {
        name: "Fatigue Life",
        attribute: "fatigue_life",
        description: "",
        _type: "pair",
        _category: "pairs",
        attribute1: {
            name: "Stress ratio",
            attribute: "stress_ratio",
            _type: "fraction",
            units: [],
            value: null,
            unit: null
        },
        attribute2: {
            name: "Cycles to failure",
            attribute: "cycles_to_failure",
            _type: "number",
            units: [],
            value: null,
            unit: null
        },
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function CrackGrowth() {
    this.property = {
        name: "Crack Growth",
        attribute: "crack_growth",
        description: "",
        _type: "pair",
        _category: "pairs",
        attribute1: {
            name: "Stress intensity",
            attribute: "stress_intensity",
            _type: "number",
            units: [],
            value: null,
            unit: "GPa*m^(1/2)"
        },
        attribute2: {
            name: "da/dN",
            attribute: "da_dn",
            _type: "number",
            units: [],
            value: null,
            unit: "m/cycle"
        },
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

function ParticleSizeDistribution() {
    this.property = {
        name: "Particle Size Distribution",
        attribute: "particle_size_distribution",
        description: "",
        _type: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function ParticleShapeDistribution() {
    this.property = {
        name: "Particle Shape Distribution",
        attribute: "particle_shape_distribution",
        description: "",
        _type: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function GrainSizeDistribution() {
    this.property = {
        name: "Grain Size Distribution",
        attribute: "grain_size_distribution",
        description: "",
        _type: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function GrainOrientationDistribution() {
    this.property = {
        name: "Grain Orientation Distribution",
        attribute: "grain_orientation_distribution",
        description: "",
        _type: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function StressStrain() {
    this.property = {
        name: "Stress Vs Strain",
        attribute: "stress_strain",
        description: "",
        _type: "line",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function StressDisplacement() {
    this.property = {
        name: "Stress Vs Displacement",
        attribute: "stress_displacement",
        description: "",
        _type: "line",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function PhasesPresent() {
    this.property = {
        name: "Phases Present",
        attribute: "phases_present",
        description: "",
        _type: "list",
        _category: "array",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

function Shape() {
    this.property = {
        name: "Shape",
        attribute: "shape",
        description: "",
        _type: "selection",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: "",
        value: null,
        choices: [{"name": "Round Bar", "value" : "round_bar"},
            {"name": "Rectangular", "value" : "rectangular"},
            {"name": "Notch", "value" : "notch"}]
    };
    this.validators = [];
}

function GaugeLength() {
    this.property = {
        name: "Gauge Length",
        attribute: "gauge_length",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["mm", "cm", "m"],
        nunit: "mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

function GaugeThickness() {
    this.property = {
        name: "Gauge Thickness",
        attribute: "gauge_thickness",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["mm", "cm", "m"],
        nunit: "mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

function Area() {
    this.property = {
        name: "Area",
        attribute: "area",
        description: "",
        _type: "number",
        _category: "scalar",
        units: ["mm*mm", "cm*cm"],
        nunit: "mm*mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

function Hardness() {
    this.property = {
        name: "Hardness",
        attribute: "hardness",
        description: "",
        _type: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}