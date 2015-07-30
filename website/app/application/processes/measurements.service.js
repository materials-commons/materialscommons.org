Application.Services.factory("measurements", measurementsService);

function measurementsService() {
    var self = this;
    self.activeTemplate = {};
    self.measurements = [
        {
            name: "Composition",
            attribute: "composition",
            description: "Composition of sample",
            category: "scalar",
            fn: Composition
        },
        {
            name: "Area Fraction",
            attribute: "area_fraction",
            description: "",
            category: "scalar",
            fn: AreaFraction
        },
        {
            name: "Volume Fraction",
            attribute: "volume_fraction",
            description: "",
            category: "scalar",
            fn: VolumeFraction
        },
        {
            name: "Dislocation Density",
            attribute: "dislocation_density",
            description: "",
            category: "scalar",
            fn: DislocationDensity
        },
        {
            name: "Length",
            attribute: "length",
            description: "",
            category: "scalar",
            fn: Length
        },
        {
            name: "Width",
            attribute: "width",
            description: "",
            category: "scalar",
            fn: Width
        },
        {
            name: "Height",
            attribute: "height",
            description: "",
            category: "scalar",
            fn: Height
        },
        {
            name: "Density",
            attribute: "density",
            description: "",
            category: "scalar",
            fn: Density
        },
        {
            name: "Volume",
            attribute: "volume",
            description: "",
            category: "scalar",
            fn: Volume
        },
        {
            name: "Young's Modulus",
            attribute: "youngs_modulus",
            description: "",
            category: "scalar",
            fn: YoungsModulus
        },
        {
            name: "Tensile Yield Strength",
            attribute: "tensile_yield_strength",
            description: "",
            category: "scalar",
            fn: TensileYieldStrength
        },
        {
            name: "Ultimate Tensile Strength",
            attribute: "ultimate_tensile_strength",
            description: "",
            category: "scalar",
            fn: UltimateTensileStrength
        },
        {
            name: "Strain To Fracture",
            attribute: "strain_to_fracture",
            description: "",
            category: "scalar",
            fn: StrainToFracture
        },
        {
            name: "Space Group",
            attribute: "space_group",
            description: "",
            category: "scalar",
            fn: SpaceGroup
        },
        {
            name: "Point Group",
            attribute: "point_group",
            description: "",
            category: "scalar",
            fn: PointGroup
        },
        {
            name: "Crystal System",
            attribute: "crystal_system",
            description: "",
            category: "scalar",
            fn: CrystalSystem
        },
        {
            name: "Band Gap",
            attribute: "band_gap",
            description: "",
            category: "scalar",
            fn: BandGap
        },
        //{
        //    name: "Fatigue Life",
        //    attribute: "fatigue_life",
        //    description: "",
        //    category: "pairs",
        //    fn: FatigueLife
        //},
        //{
        //    name: "Crack Growth",
        //    attribute: "crack_growth",
        //    description: "",
        //    category: "pairs",
        //    fn: CrackGrowth
        //},
        {
            name: "Particle Size Distribution",
            attribute: "particle_size_distribution",
            description: "",
            category: "chart",
            fn: ParticleSizeDistribution
        },
        {
            name: "Particle Shape Distribution",
            attribute: "particle_shape_distribution",
            description: "",
            category: "chart",
            fn: ParticleShapeDistribution
        },
        {
            name: "Grain Size Distribution",
            attribute: "grain_size_distribution",
            description: "",
            category: "chart",
            fn: GrainSizeDistribution
        },
        {
            name: "Grain Orientation Distribution",
            attribute: "grain_orientation_distribution",
            description: "",
            category: "chart",
            fn: GrainOrientationDistribution
        },
        {
            name: "Stress Strain",
            attribute: "stress_strain",
            description: "",
            category: "chart",
            fn: StressStrain
        },
        {
            name: "Stress Displacement",
            attribute: "stress_displacement",
            description: "",
            category: "chart",
            fn: StressDisplacement
        }
        //{
        //    name: "Phases Present",
        //    attribute: "phases_present",
        //    description: "",
        //    category: "list",
        //    fn: PhasesPresent
        //}
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