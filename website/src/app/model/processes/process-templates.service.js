(function (module) {
    module.factory("processTemplates", processTemplates);
    processTemplates.$inject = ["User"];

    function processTemplates(User) {
        var self = this;
        self.templates = [
            {
                name: "APT",
                description: "Atom Probe Tomography",
                fn: Apt,
                does_transform: false
            },
            {
                name: "APT Data Analysis",
                description: "Atom Probe Tomography Data Analysis",
                fn: AptDataAnalysis,
                does_transform: false
            },
            {
                name: "APT Data Reconstruction",
                description: "APT Data Reconstruction",
                fn: AptDataReconstruction,
                does_transform: false
            },
            {
                name: "SEM",
                description: "Stem Electron Microscopy",
                fn: Sem,
                does_transform: false
            },
            {
                name: "As Received",
                description: "As Received process is used to create new samples.",
                fn: AsReceived,
                does_transform: false
            },
            {
                name: "Broad Ion Beam Milling",
                description: "Broad Ion Beam Milling",
                fn: BroadIonBeamMilling,
                does_transform: true
            },
            {
                name: "Cogging",
                description: "Cogging",
                fn: Cogging,
                does_transform: true
            },
            {
                name: "Compression",
                description: "Compression Test",
                fn: Compression,
                does_transform: true
            },
            {
                name: "Computation",
                description: "Computation",
                fn: Computation,
                does_transform: false
            },
            {
                name: "Creep",
                description: "Creep",
                fn: Creep,
                does_transform: true
            },
            {
                name: "DIC Patterning",
                description: "DIC Patterning",
                fn: DicPatterning,
                does_transform: false
            },
            {
                name: "DIC Statistical Modelling",
                description: "DIC Statistical Modelling",
                fn: DicStatisticalModelling,
                does_transform: false
            },
            {
                name: "Electropolishing",
                description: "Electropolishing",
                fn: Electropolishing,
                does_transform: true
            },
            {
                name: "Etching",
                description: "Etching",
                fn: Etching,
                does_transform: true
            },
            {
                name: "EBSD SEM Data Collection",
                description: "EBSD SEM Data Collection",
                fn: EbsdSemDataCollection,
                does_transform: false
            },
            {
                name: "EPMA Data Collection",
                description: "EPMA Data Collection",
                fn: EpmaDataCollection,
                does_transform: false
            },
            {
                name: "Low Cycle Fatigue",
                description: "Low Cycle Fatigue",
                fn: LowCycleFatigue,
                does_transform: true
            },
            {
                name: "Ultrasonic Fatigue",
                description: "Ultrasonic Fatigue",
                fn: UltrasonicFatigue,
                does_transform: true
            },
            {
                name: "TEM",
                description: "TEM",
                fn: TEM,
                does_transform: false
            },
            {
                name: "Heat Treatment",
                description: "Heat Treatment",
                fn: HeatTreatment,
                does_transform: true
            },
            {
                name: "As Measured",
                description: "As Measured process allows you to add in all your As Received measurements",
                fn: AsMeasured,
                does_transform: false
            },
            {
                name: "Hardness",
                description: "Hardness",
                fn: Hardness1,
                does_transform: true
            }
        ];

        self.templatesByName = _.indexBy(self.templates, 'name');

        function addProjectTemplates(templates, projectTemplates) {
            var filledOutProjectTemplates = projectTemplates.map(function(processTemplate) {
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
}(angular.module('materialscommons')));
