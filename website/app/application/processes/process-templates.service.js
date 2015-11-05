(function (module) {
    module.factory("processTemplates",
        [processTemplates]);

    function processTemplates() {
        var self = this;
        self.activeTemplate = {};
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
                name: "Annealing",
                description: "Annealing",
                fn: Annealing,
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

        return {

            templates: function () {
                return self.templates;
            },

            newInstance: function (template) {
                return new template.fn();
            },

            getActiveTemplate: function () {
                return self.activeTemplate;
            },

            setActiveTemplate: function (template) {
                if(template.fn){
                    self.activeTemplate = this.newInstance(template);
                }else{
                    self.activeTemplate = template;
                }

            },

            getTemplateByName: function (what) {
                var i = _.indexOf(self.templates, function (template) {
                    return template.name === what;
                });

                if (i > -1){
                    return this.newInstance(self.templates[i]);
                }
            }
        };
    }
}(angular.module('materialscommons')));
