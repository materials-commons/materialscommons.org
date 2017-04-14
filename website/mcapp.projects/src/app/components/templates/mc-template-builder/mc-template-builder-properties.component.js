class MCTemplateBuilderPropertiesComponentController {
    /*@ngInject*/
    constructor(templateUnits) {
        this.templateUnits = templateUnits;
    }

    addUnits(property) {
        this.templateUnits.showChoices().then(
            (unitType) => {
                property.units = unitType.units;
                property.hasUnitGroup = true;
            }
        )
    }

    checkIfEmpty(property) {
        property.hasUnitGroup = units.length;
    }
}

angular.module('materialscommons').component('mcTemplateBuilderProperties', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder-properties.html',
    controller: MCTemplateBuilderPropertiesComponentController,
    bindings: {
        properties: '=',
        message: '@'
    }
});