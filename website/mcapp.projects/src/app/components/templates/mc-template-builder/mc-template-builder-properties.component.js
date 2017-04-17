class MCTemplateBuilderPropertiesComponentController {
    /*@ngInject*/
    constructor(templateUnits, templatePropertyTypes) {
        this.templateUnits = templateUnits;
        this.templatePropertyTypes = templatePropertyTypes;
    }

    addUnits(property) {
        this.templateUnits.showChoices().then(
            (unitType) => {
                property.units = unitType.units;
                property.hasUnitGroup = true;
            }
        )
    }

    updateAttribute(property) {
        property.attribute = this.templatePropertyTypes.nameToAttr(property.name);
    }

    checkIfEmpty(property) {
        property.hasUnitGroup = property.units.length;
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