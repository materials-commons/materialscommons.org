class MCTemplateBuilderElementsComponentController {
    /*@ngInject*/
    constructor() {
        this.measurements = [];
        this.setup = [{
            attribute: "instrument",
            name: "Instrument",
            properties: []
        }];
    }

    $onInit() {
        this._loadMeasurements();
        this._loadSetup();
    }

    _loadMeasurements() {
        this.measurements.push(this.constructor.createProperty("Temperature", "number"));
        for (let i = 0; i < 100; i++) {
            this.measurements.push(this.constructor.createProperty(`${i} - Composition`, "composition", i, {units: ["at%", "wt%", "atoms"]}));
        }
    }

    _loadSetup() {
        for (let i = 0; i < 100; i++) {
            this.setup[0].properties.push(this.constructor.createProperty(`${i} - Property`, "number", i, {units: ["c", "f"]}));
        }
    }

    static nameToAttr(name) {
        return name.replace(/\s+/g, '_').replace(/\//g, '_').replace(/-/g, '_').toLowerCase()
    }

    static toSelectionChoices(choices) {
        return choices.map(choice => ({
            name: choice,
            value: MCTemplateBuilderElementsComponentController.nameToAttr(choice)
        }))
    }

    static createProperty(name, otype, id,
                          {choices = [], required = false, units = [], description = ""} = {
                              choices: [],
                              required: false,
                              units: [],
                              description: ""
                          }) {
        return {
            name: name,
            id: id,
            attribute: MCTemplateBuilderElementsComponentController.nameToAttr(name),
            description: description,
            otype: otype,
            choices: MCTemplateBuilderElementsComponentController.toSelectionChoices(choices),
            required: required,
            units: units
        };
    }
}

angular.module('materialscommons').component('mcTemplateBuilderElements', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-elements.html',
    controller: MCTemplateBuilderElementsComponentController,
    bindings: {
        elements: '<'
    }
});