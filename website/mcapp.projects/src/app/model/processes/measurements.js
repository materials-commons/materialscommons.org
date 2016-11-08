export function Composition() {
    this.property = {
        name: "Composition",
        attribute: "composition",
        description: "Composition of sample",
        otype: "composition",
        _category: "scalar",
        units: ["at%", "wt%"],
        nunit: "at%",
        unit: null,
        value: null,
        element: ""
    };

    this.validators = [];
}

export function AreaFraction() {
    this.property = {
        name: "Area Fraction",
        attribute: "area_fraction",
        description: "",
        otype: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

export function VolumeFraction() {
    this.property = {
        name: "Volume Fraction",
        attribute: "volume_fraction",
        description: "",
        otype: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };

    this.validators = [];
}

export function DislocationDensity() {
    this.property = {
        name: "Dislocation Density",
        attribute: "dislocation_density",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "m^-2",
        unit: "m^-2",
        value: null
    };

    this.validators = [];
}

export function Length() {
    this.property = {
        name: "Length",
        attribute: "length",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };

    this.validators = [];
}

export function Width() {
    this.property = {
        name: "Width",
        attribute: "width",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };
    this.validators = [];
}

export function Height() {
    this.property = {
        name: "Height",
        attribute: "height",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["m", "cm"],
        nunit: "m",
        unit: "",
        value: null
    };
    this.validators = [];
}

export function Density() {
    this.property = {
        name: "Density",
        attribute: "density",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "kg/m^3",
        unit: "kg/m^3",
        value: null
    };
    this.validators = [];
}

export function Volume() {
    this.property = {
        name: "Volume",
        attribute: "volume",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "m^3",
        unit: "m^3",
        value: null
    };
    this.validators = [];
}

export function YoungsModulus() {
    this.property = {
        name: "Young's modulus",
        attribute: "youngs_modulus",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

export function TensileYieldStrength() {
    this.property = {
        name: "Tensile Yield Strength",
        attribute: "tensile_yield_strength",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

export function UltimateTensileStrength() {
    this.property = {
        name: "Ultimate Tensile Strength",
        attribute: "ultimate_tensile_strength",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "GPa",
        unit: "GPa",
        value: null
    };
    this.validators = [];
}

export function StrainToFracture() {
    this.property = {
        name: "Strain To Fracture",
        attribute: "strain_to_fracture",
        description: "",
        otype: "fraction",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

export function SpaceGroup() {
    this.property = {
        name: "Space Group",
        attribute: "space_group",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

export function PointGroup() {
    this.property = {
        name: "Point Group",
        attribute: "point_group",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

export function CrystalSystem() {
    this.property = {
        name: "Crystal System",
        attribute: "crystal_system",
        description: "",
        otype: "string",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: null,
        value: null
    };
    this.validators = [];
}

export function BandGap() {
    this.property = {
        name: "Band Gap",
        attribute: "band_gap",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function FatigueLife() {
    this.property = {
        name: "Fatigue Life",
        attribute: "fatigue_life",
        description: "",
        otype: "pair",
        _category: "pairs",
        attribute1: {
            name: "Stress ratio",
            attribute: "stress_ratio",
            otype: "fraction",
            units: [],
            value: null,
            unit: null
        },
        attribute2: {
            name: "Cycles to failure",
            attribute: "cycles_to_failure",
            otype: "number",
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

export function CrackGrowth() {
    this.property = {
        name: "Crack Growth",
        attribute: "crack_growth",
        description: "",
        otype: "pair",
        _category: "pairs",
        attribute1: {
            name: "Stress intensity",
            attribute: "stress_intensity",
            otype: "number",
            units: [],
            value: null,
            unit: "GPa*m^(1/2)"
        },
        attribute2: {
            name: "da/dN",
            attribute: "da_dn",
            otype: "number",
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

export function ParticleSizeDistribution() {
    this.property = {
        name: "Particle Size Distribution",
        attribute: "particle_size_distribution",
        description: "",
        otype: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function ParticleShapeDistribution() {
    this.property = {
        name: "Particle Shape Distribution",
        attribute: "particle_shape_distribution",
        description: "",
        otype: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function GrainSizeDistribution() {
    this.property = {
        name: "Grain Size Distribution",
        attribute: "grain_size_distribution",
        description: "",
        otype: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function GrainOrientationDistribution() {
    this.property = {
        name: "Grain Orientation Distribution",
        attribute: "grain_orientation_distribution",
        description: "",
        otype: "histogram",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function StressStrain() {
    this.property = {
        name: "Stress Vs Strain",
        attribute: "stress_strain",
        description: "",
        otype: "line",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function StressDisplacement() {
    this.property = {
        name: "Stress Vs Displacement",
        attribute: "stress_displacement",
        description: "",
        otype: "line",
        _category: "chart",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function PhasesPresent() {
    this.property = {
        name: "Phases Present",
        attribute: "phases_present",
        description: "",
        otype: "list",
        _category: "array",
        units: [],
        nunit: "eV",
        unit: "eV",
        value: null
    };
    this.validators = [];
}

export function Shape() {
    this.property = {
        name: "Shape",
        attribute: "shape",
        description: "",
        otype: "selection",
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

export function GaugeLength() {
    this.property = {
        name: "Gauge Length",
        attribute: "gauge_length",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["mm", "cm", "m"],
        nunit: "mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

export function GaugeThickness() {
    this.property = {
        name: "Gauge Thickness",
        attribute: "gauge_thickness",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["mm", "cm", "m"],
        nunit: "mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

export function Area() {
    this.property = {
        name: "Area",
        attribute: "area",
        description: "",
        otype: "number",
        _category: "scalar",
        units: ["mm*mm", "cm*cm"],
        nunit: "mm*mm",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}

export function Hardness() {
    this.property = {
        name: "Hardness",
        attribute: "hardness",
        description: "",
        otype: "number",
        _category: "scalar",
        units: [],
        nunit: "",
        unit: "",
        value: null,
        choices: []
    };
    this.validators = [];
}
