Application.Services.factory("measurements", measurementsService);

function measurementsService() {
    var self = this;
    self.activeTemplate = {};
    self.measurements = [
        {
            name: "Composition",
            description: "Composition of sample",
            category: "scalar",
            fn: Composition
        },
        {
            name: "Area Fraction",
            description: "",
            category: "scalar",
            fn: AreaFraction
        },
        {
            name: "Volume Fraction",
            description: "",
            category: "scalar",
            fn: VolumeFraction
        },
        {
            name: "Dislocation Density",
            description: "",
            category: "scalar",
            fn: DislocationDensity
        },
        {
            name: "Length",
            description: "",
            category: "scalar",
            fn: Length
        },
        {
            name: "Width",
            description: "",
            category: "scalar",
            fn: Width
        },
        {
            name: "Height",
            description: "",
            category: "scalar",
            fn: Height
        },
        {
            name: "Density",
            description: "",
            category: "scalar",
            fn: Density
        },
        {
            name: "Volume",
            description: "",
            category: "scalar",
            fn: Volume
        },
        {
            name: "Young's Modulus",
            description: "",
            category: "scalar",
            fn: YoungsModulus
        },
        {
            name: "Tensile Yield Strength",
            description: "",
            category: "scalar",
            fn: TensileYieldStrength
        },
        {
            name: "Ultimate Tensile Strength",
            description: "",
            category: "scalar",
            fn: UltimateTensileStrength
        },
        {
            name: "Strain To Fracture",
            description: "",
            category: "scalar",
            fn: StrainToFracture
        },
        {
            name: "Space Group",
            description: "",
            category: "scalar",
            fn: SpaceGroup
        },
        {
            name: "Point Group",
            description: "",
            category: "scalar",
            fn: PointGroup
        },
        {
            name: "Crystal System",
            description: "",
            category: "scalar",
            fn: CrystalSystem
        },
        {
            name: "Band Gap",
            description: "",
            category: "scalar",
            fn: BandGap
        },
        {
            name: "Fatigue Life",
            description: "",
            category: "pairs",
            fn: FatigueLife
        },
        {
            name: "Crack Growth",
            description: "",
            category: "pairs",
            fn: CrackGrowth
        },
        {
            name: "Particle Size Distribution",
            description: "",
            category: "chart",
            fn: ParticleSizeDistribution
        },
        {
            name: "Particle Shape Distribution",
            description: "",
            category: "chart",
            fn: ParticleShapeDistribution
        },
        {
            name: "Grain Size Distribution",
            description: "",
            category: "chart",
            fn: GrainSizeDistribution
        },
        {
            name: "Grain Orientation Distribution",
            description: "",
            category: "chart",
            fn: GrainOrientationDistribution
        },
        {
            name: "Stress Strain",
            description: "",
            category: "chart",
            fn: StressStrain
        },
        {
            name: "Stress Displacement",
            description: "",
            category: "chart",
            fn: StressDisplacement
        }
    ];

    return {
        templates: function() {
            return self.measurements;
        },

        newInstance: function(m) {
            return new m.fn();
        }
    };
}

;