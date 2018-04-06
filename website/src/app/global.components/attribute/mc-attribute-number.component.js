class MCAttributeNumberComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, toast, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSettingProperty(property) {

        if (!property.value) {
            return;
        }

        if (!MCAttributeNumberComponentController.isNumberOType(property.otype)) {
            return;
        }

        if (!property.units) {
            property.units = [];
        }

        if (property.units.length && !property.unit) {
            return;
        }

        property.setup_attribute = this.attribute;
        let propertyArgs = {
            template_id: this.templateId,
            properties: [property]
        };

        this.experimentsAPI.updateProcess(this.projectId, this.experimentId, this.processId, propertyArgs)
            .then(
                () => null,
                () => this.toast.error('Unable to update property')
            );
    }

    static isNumberOType(otype) {
        switch (otype) {
            case "number": return true;
            case "float": return true;
            case "integer": return true;
            default: return false;
        }
    }
}

angular.module('materialscommons').component('mcAttributeNumber', {
    template: require('./mc-attribute-number.html'),
    controller: MCAttributeNumberComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
