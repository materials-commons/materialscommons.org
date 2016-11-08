import * as measurements from './measurements';

export function measurementsService() {
    'ngInject';

    var self = this;
    self.activeTemplate = {};
    self.copy = [];
    self.touchedProperties = {};
    self.activeProperty = {};
    self.copySample = {};
    self.modal = {sample: {}};
    self.measurements = [
        {
            name: "Composition",
            attribute: "composition",
            description: "Composition of sample",
            category: "scalar",
            fn: measurements.Composition
        },
        {
            name: "Area Fraction",
            attribute: "area_fraction",
            description: "",
            category: "scalar",
            fn: measurements.AreaFraction
        },
        {
            name: "Volume Fraction",
            attribute: "volume_fraction",
            description: "",
            category: "scalar",
            fn: measurements.VolumeFraction
        },
        {
            name: "Dislocation Density",
            attribute: "dislocation_density",
            description: "",
            category: "scalar",
            fn: measurements.DislocationDensity
        },
        {
            name: "Length",
            attribute: "length",
            description: "",
            category: "scalar",
            fn: measurements.Length
        },
        {
            name: "Width",
            attribute: "width",
            description: "",
            category: "scalar",
            fn: measurements.Width
        },
        {
            name: "Height",
            attribute: "height",
            description: "",
            category: "scalar",
            fn: measurements.Height
        },
        {
            name: "Density",
            attribute: "density",
            description: "",
            category: "scalar",
            fn: measurements.Density
        },
        {
            name: "Volume",
            attribute: "volume",
            description: "",
            category: "scalar",
            fn: measurements.Volume
        },
        {
            name: "Young's Modulus",
            attribute: "youngs_modulus",
            description: "",
            category: "scalar",
            fn: measurements.YoungsModulus
        },
        {
            name: "Tensile Yield Strength",
            attribute: "tensile_yield_strength",
            description: "",
            category: "scalar",
            fn: measurements.TensileYieldStrength
        },
        {
            name: "Ultimate Tensile Strength",
            attribute: "ultimate_tensile_strength",
            description: "",
            category: "scalar",
            fn: measurements.UltimateTensileStrength
        },
        {
            name: "Strain To Fracture",
            attribute: "strain_to_fracture",
            description: "",
            category: "scalar",
            fn: measurements.StrainToFracture
        },
        {
            name: "Space Group",
            attribute: "space_group",
            description: "",
            category: "scalar",
            fn: measurements.SpaceGroup
        },
        {
            name: "Point Group",
            attribute: "point_group",
            description: "",
            category: "scalar",
            fn: measurements.PointGroup
        },
        {
            name: "Crystal System",
            attribute: "crystal_system",
            description: "",
            category: "scalar",
            fn: measurements.CrystalSystem
        },
        {
            name: "Band Gap",
            attribute: "band_gap",
            description: "",
            category: "scalar",
            fn: measurements.BandGap
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
            fn: measurements.ParticleSizeDistribution
        },
        {
            name: "Particle Shape Distribution",
            attribute: "particle_shape_distribution",
            description: "",
            category: "chart",
            fn: measurements.ParticleShapeDistribution
        },
        {
            name: "Grain Size Distribution",
            attribute: "grain_size_distribution",
            description: "",
            category: "chart",
            fn: measurements.GrainSizeDistribution
        },
        {
            name: "Grain Orientation Distribution",
            attribute: "grain_orientation_distribution",
            description: "",
            category: "chart",
            fn: measurements.GrainOrientationDistribution
        },
        {
            name: "Stress Strain",
            attribute: "stress_strain",
            description: "",
            category: "chart",
            fn: measurements.StressStrain
        },
        {
            name: "Stress Displacement",
            attribute: "stress_displacement",
            description: "",
            category: "chart",
            fn: measurements.StressDisplacement
        },
        //{
        //    name: "Phases Present",
        //    attribute: "phases_present",
        //    description: "",
        //    category: "list",
        //    fn: PhasesPresent
        //} ,
        {
            name: "Shape",
            attribute: "shape",
            description: "",
            category: "scalar",
            fn: measurements.Shape
        },
        {
            name: "Gauge Length",
            attribute: "gauge_length",
            description: "",
            category: "scalar",
            fn: measurements.GaugeLength
        },
        {
            name: "Gauge Thickness",
            attribute: "gauge_thickness",
            description: "",
            category: "scalar",
            fn: measurements.GaugeThickness
        },
        {
            name: "Area",
            attribute: "area",
            description: "",
            category: "scalar",
            fn: measurements.Area
        }
    ];

    return {
        templates: function() {
            self.copy = angular.copy(self.measurements);
        },

        newInstance: function(m) {
            return new m.fn();
        },

        templatesCopy: function() {
            return self.copy
        },

        verifyAndSave: function(property) {
            if (('value' in property) && property.value !== null) {
                if (this.isExistingPropertyValid(property)) {
                    //check for the sample touchedProperties
                    var key = self.modal.sample.name;
                    if (self.touchedProperties.hasOwnProperty(key)) {
                        self.touchedProperties[key].push(property);
                    } else {
                        self.touchedProperties[key] = [];
                        self.touchedProperties[key].push(property);
                    }
                    this.processMeasurments(property);
                    return self.modal.sample;
                }
                else {
                    return false;
                }
            } else {
                return true;
            }
        },

        processMeasurments: function(property) {
            var type = property.otype;
            var values = [];
            switch (type) {
            case 'number':
                values = property.value.split("\n");
                property.measurements = [];
                values.forEach(function(v) {
                    property.measurements.push({
                        value: v,
                        otype: type,
                        unit: property.unit,
                        attribute: property.attribute
                    });
                });
                this.saveToSample(property);
                break;
            case 'fraction':
                values = property.value.split("\n");
                property.measurements = [];
                values.forEach(function(v) {
                    property.measurements.push({
                        value: v,
                        otype: type,
                        unit: property.unit,
                        attribute: property.attribute
                    });
                });
                this.saveToSample(property);
                break;
            case 'histogram':
                property.measurements = [];
                property.measurements.push({
                    value: property.value,
                    otype: type,
                    unit: property.unit,
                    attribute: property.attribute
                });
                this.saveToSample(property);
                break;
            case 'line':
                property.measurements = [];
                property.measurements.push({
                    value: property.value,
                    otype: type,
                    unit: property.unit,
                    attribute: property.attribute
                });
                this.saveToSample(property);
                break;
            case 'selection':
                property.measurements = [];
                property.measurements.push({
                    value: property.value,
                    otype: type,
                    unit: property.unit,
                    attribute: property.attribute
                });
                this.saveToSample(property);
                break;
            case 'composition':
                var elements = property.value.elements.split("\n");
                values = property.value.values.split("\n");
                property.measurements = [];
                for (var i = 0; i < elements.length - 1; i++) {
                    property.measurements.push({
                        value: values[i],
                        element: elements[i],
                        otype: property.otype,
                        unit: property.unit,
                        attribute: property.attribute
                    });
                }
                if (elements.length > 1) {
                    this.saveToSample(property);
                }
                break;
            }
        },

        isExistingPropertyValid: function(property) {
            var type = property.otype;
            var values = [];
            switch (type) {
            case 'number':
                values = property.value.split("\n");
                return this.isNumberValid(values);
            case 'fraction':
                values = property.value.split("\n");
                return this.isFractionValid(values);
            case 'histogram':
                values = property.value.values.split("\n");
                return this.isNumberValid(values);
            case 'line':
                values = property.value.values.split("\n");
                return this.isNumberValid(values);
            case 'selection':
                return true;
            case 'composition':
                values = property.value.values.split("\n");
                return this.isNumberValid(values);
            }
        },

        isNumberValid: function(values) {
            var isNumeric = true;
            values.forEach(function(v) {
                if (isNaN(v)) {
                    isNumeric = false;
                }
            });
            return isNumeric;
        },

        isFractionValid: function(values) {
            var isNumeric = true;
            var fraction = [];
            values.forEach(function(v) {
                fraction = v.split("/");
                if (isNaN(fraction[0]) || isNaN(fraction[1])) {
                    isNumeric = false;
                }
            });
            return isNumeric;
        },

        saveToSample: function(property) {
            var i, j, k;
            i = _.indexOf(self.copySample.properties, function(entry) {
                return property.name === entry.name;
            });
            if (i < 0) {
                j = _.indexOf(self.modal.sample.new_properties, function(prop) {
                    return property.name === prop.name;
                });
                if (j < 0) {
                    self.modal.sample.new_properties.push(property);
                } else {
                    self.modal.sample.new_properties[j] = property;
                }
            } else {
                var old_prop = self.copySample.properties[i];
                property.property_set_id = old_prop.property_set_id;
                property.property_id = old_prop.property_id;
                k = _.indexOf(self.modal.sample.old_properties, function(entry) {
                    return property.name === entry.name;
                });
                if (k > 0) {
                    self.modal.sample.old_properties[k] = property;

                } else {
                    self.modal.sample.old_properties.push(property);
                }
            }
        },

        getTouchedProperties: function(key) {
            if (self.touchedProperties.hasOwnProperty(key)) {
                return self.touchedProperties[key]
            } else {
                return [];
            }
        },

        copySample: function(sample) {
            self.copySample = angular.copy(sample);
            self.modal.sample = sample;
        },

        reset: function() {
            self.touchedProperties = {};
        }
    };
}
