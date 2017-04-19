class TemplatePropertyTypesService {
    /*@ngInject*/
    constructor($q, templateUnits) {
        this.$q = $q;
        this.templateUnits = templateUnits;
        this.setupPropertyTypes = [{
            attribute: "instrument",
            name: "Instrument",
            properties: []
        }];
        this.measurementPropertyTypes = [];
        this.allPropertyTypes = [];
        this._loadPropertyTypes();
    }

    _loadPropertyTypes() {
        this.unitTypes = this.templateUnits._getUnitTypes();
        this._loadAllPropertyTypes();
        this._loadMeasurements();
        this._loadSetup();
    }

    _loadAllPropertyTypes() {
        let u = this.templateUnits.findUnitType('Composition', this.unitTypes);
        this.allPropertyTypes.push(createProperty('Composition', 'composition', {units: u}));
        this.allPropertyTypes.push(createProperty('String', 'string'));
        this.allPropertyTypes.push(createProperty('Integer', 'integer'));
        this.allPropertyTypes.push(createProperty('Date', 'date'));
        this.allPropertyTypes.push(createProperty('Float', 'float'));
        this.allPropertyTypes.push(createProperty('Selection', 'selection'));

        u = this.templateUnits.findUnitType('Voltage', this.unitTypes);
        this.allPropertyTypes.push(createProperty('Voltage', 'float', {units: u}));

        u = this.templateUnits.findUnitType('Strain', this.unitTypes);
        this.allPropertyTypes.push(createProperty('Strain', 'float', {units: u}));

        u = this.templateUnits.findUnitType('Time', this.unitTypes);
        this.allPropertyTypes.push(createProperty('Time', 'integer', {units: u}));

        u = this.templateUnits.findUnitType('Pressure', this.unitTypes);
        this.allPropertyTypes.push(createProperty('Pressure', 'integer', {units: u}));
    }

    _loadMeasurements() {
        this.measurementPropertyTypes = this.allPropertyTypes;
    }

    _loadSetup() {
        this.setupPropertyTypes[0].properties = this.allPropertyTypes;
    }

    getMeasurementPropertyTypes() {
        return this.$q.when(this.measurementPropertyTypes);
    }

    getSetupPropertyTypes() {
        return this.$q.when(this.setupPropertyTypes);
    }

    nameToAttr(name) {
        return _nameToAttr(name)
    }
}

function _nameToAttr(name) {
    return name.replace(/\s+/g, '_').replace(/\//g, '_').replace(/-/g, '_').toLowerCase()
}

function toSelectionChoices(choices) {
    return choices.map(choice => ({
        name: choice,
        value: _nameToAttr(choice)
    }))
}

function createProperty(name, otype, {choices = [], required = false, units = [], description = ""} = {
                            choices: [],
                            required: false,
                            editUnits: false,
                            units: [],
                            description: ""
                        }) {
    return {
        name: name,
        attribute: _nameToAttr(name),
        description: description,
        otype: otype,
        choices: toSelectionChoices(choices),
        required: required,
        units: units
    };
}


angular.module('materialscommons').service('templatePropertyTypes', TemplatePropertyTypesService);
