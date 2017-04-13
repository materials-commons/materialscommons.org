class MCTemplateBuilderSetupComponentController {
    /*@ngInject*/
    constructor(templateUnits) {
        this.unit = '';
        this.setup = [{
            name: 'Instrument',
            attribute: 'instrument',
            properties: []
        }];
        this.templateUnits = templateUnits;
    }

    addUnits(property) {
        this.templateUnits.showChoices().then(
            (unitType) => property.units = unitType.units
        )
    }

    addNewUnit(property) {
        property.units.push(this.unit);
        property.editUnits = false;
        this.unit = '';
    }
}

angular.module('materialscommons').component('mcTemplateBuilderSetup', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-setup.html',
    controller: MCTemplateBuilderSetupComponentController,
    bindings: {
        template: '<'
    }
});