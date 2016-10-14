import * as processes from './processes';

export function processTemplates(User) {
    'ngInject';

    var self = this;
    self.templates = [
        {
            name: "APT",
            description: "Atom Probe Tomography",
            process_type: 'measurement',
            fn: processes.Apt,
            does_transform: false
        },
        {
            name: "APT Data Analysis",
            description: "Atom Probe Tomography Data Analysis",
            process_type: 'analysis',
            fn: processes.AptDataAnalysis,
            does_transform: false
        },
        {
            name: "APT Data Reconstruction",
            description: "APT Data Reconstruction",
            process_type: 'analysis',
            fn: processes.AptDataReconstruction,
            does_transform: false
        },
        {
            name: "SEM",
            description: "Stem Electron Microscopy",
            process_type: 'measurement',
            fn: processes.Sem,
            does_transform: false
        },
        {
            name: "Create Samples",
            description: "Create Samples process is used to create new samples.",
            process_type: 'transform',
            fn: processes.CreateSamples,
            does_transform: false
        },
        {
            name: "Broad Ion Beam Milling",
            description: "Broad Ion Beam Milling",
            process_type: 'transform',
            fn: processes.BroadIonBeamMilling,
            does_transform: true
        },
        {
            name: "Cogging",
            description: "Cogging",
            process_type: 'transform',
            fn: processes.Cogging,
            does_transform: true
        },
        {
            name: "Compression",
            description: "Compression Test",
            process_type: 'transform',
            fn: processes.Compression,
            does_transform: true
        },
        {
            name: "Computation",
            description: "Computation",
            process_type: 'analysis',
            fn: processes.Computation,
            does_transform: false
        },
        {
            name: "Creep",
            description: "Creep",
            process_type: 'transform',
            fn: processes.Creep,
            does_transform: true
        },
        {
            name: "Sectioning",
            description: "Sectioning of a sample",
            process_type: 'transform',
            fn: processes.Sectioning,
            does_transform: false

        },
        {
            name: "DIC Patterning",
            description: "DIC Patterning",
            process_type: 'measurement',
            fn: processes.DicPatterning,
            does_transform: false
        },
        {
            name: "DIC Statistical Modelling",
            description: "DIC Statistical Modelling",
            process_type: 'analysis',
            fn: processes.DicStatisticalModelling,
            does_transform: false
        },
        {
            name: "Electropolishing",
            description: "Electropolishing",
            process_type: 'tranform',
            fn: processes.Electropolishing,
            does_transform: true
        },
        {
            name: "Etching",
            description: "Etching",
            process_type: 'tranform',
            fn: processes.Etching,
            does_transform: true
        },
        {
            name: "EBSD SEM Data Collection",
            description: "EBSD SEM Data Collection",
            process_type: 'measurement',
            fn: processes.EbsdSemDataCollection,
            does_transform: false
        },
        {
            name: "EPMA Data Collection",
            description: "EPMA Data Collection",
            process_type: 'measurement',
            fn: processes.EpmaDataCollection,
            does_transform: false
        },
        {
            name: "Low Cycle Fatigue",
            description: "Low Cycle Fatigue",
            process_type: 'transform',
            fn: processes.LowCycleFatigue,
            does_transform: true
        },
        {
            name: "Ultrasonic Fatigue",
            description: "Ultrasonic Fatigue",
            process_type: 'transform',
            fn: processes.UltrasonicFatigue,
            does_transform: true
        },
        {
            name: "TEM",
            description: "TEM",
            process_type: 'measurement',
            fn: processes.TEM,
            does_transform: false
        },
        {
            name: "Heat Treatment",
            description: "Heat Treatment",
            process_type: 'transform',
            fn: processes.HeatTreatment,
            does_transform: true
        },
        {
            name: "As Measured",
            description: "As Measured process allows you to add in all your As Received measurements",
            process_type: 'measurement',
            fn: processes.AsMeasured,
            does_transform: false
        },
        {
            name: "Hardness",
            description: "Hardness",
            process_type: 'transform',
            fn: processes.Hardness1,
            does_transform: true
        },
        {
            name: "XRD",
            description: "XRD",
            process_type: 'measurement',
            fn: processes.XRD,
            does_transform: false
        },
        {
            name: "Tension",
            description: "Tension",
            process_type: 'measurement',
            fn: processes.Tension,
            does_transform: false
        }
    ];

    self.templatesByName = _.indexBy(self.templates, 'name');

    function addProjectTemplates(templates, projectTemplates) {
        var filledOutProjectTemplates = projectTemplates.filter((ptemplate) => {
            // Remove templates that are no longer in the system.
            return self.templatesByName[ptemplate.process_name];
        }).map(function(processTemplate) {
            var templateCopy = angular.copy(self.templatesByName[processTemplate.process_name]);
            templateCopy.name = processTemplate.name;
            templateCopy.prefill = true;
            templateCopy.create = function() {
                var t = new templateCopy.fn();
                t.name = templateCopy.name;
                t.prefill = true;
                var templatePropertiesByName = _.indexBy(processTemplate.setup, 'name');
                t.setup.settings[0].properties.forEach(function(prop) {
                    if (prop.property.name in templatePropertiesByName) {
                        var propSetup = templatePropertiesByName[prop.property.name];
                        prop.property.unit = propSetup.unit;
                        prop.property.value = propSetup.value;
                    }
                });
                return t;
            };
            return templateCopy;
        });
        return templates.concat(filledOutProjectTemplates);
    }

    function markFavorites(templates, favorites) {
        var templatesByName = _.indexBy(templates, 'name');
        favorites.forEach(function(favoriteTemplate) {
            if (favoriteTemplate in templatesByName) {
                templatesByName[favoriteTemplate].favorite = true;
            }
        });
    }

    return {
        templates: function(projectTemplates, projectID) {
            var templates = angular.copy(self.templates);
            templates.forEach(function(t) {
                t.create = function() {
                    return new t.fn();
                };
            });
            projectTemplates = projectTemplates || [];
            templates = addProjectTemplates(templates, projectTemplates);
            markFavorites(templates, User.favorites(projectID).processes);
            return templates;
        },

        replace: function(templates, template) {
            var i = _.indexOf(templates, function(t) {
                return t.name === template.name;
            });
            if (i !== -1) {
                templates[i].create = function() {
                    var tproto = self.templatesByName[template.process_name];
                    var t = new tproto.fn();
                    t.name = template.name;
                    t.prefill = true;
                    t.setup.settings[0].properties = angular.copy(template.setup.settings[0].properties);
                    return t;
                }
            }
        },

        add: function(templates, template) {
            var existing = _.find(templates, {name: template.name});
            if (existing) {
                return false;
            }

            var t = angular.copy(self.templatesByName[template.process_name]);
            t.name = template.name;
            t.prefill = true;
            t.create = function() {
                var tmpl = new t.fn();
                tmpl.prefill = true;
                tmpl.name = template.name;
                tmpl.setup.settings[0].properties = angular.copy(template.setup.settings[0].properties);
                return tmpl;
            };

            templates.push(t);
            return templates;
        }
    };
}

