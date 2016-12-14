class MCAttributeNumberComponentController {
    /*@ngInject*/
    constructor(experimentsService, toast, $stateParams) {
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSettingProperty(property) {

        if (!property.value) {
            return;
        }

        if (property.otype != "number") {
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

        this.experimentsService.updateProcess(this.projectId, this.experimentId, this.processId, propertyArgs)
            .then(
                () => null,
                () => this.toast.error('Unable to update property')
            );
    }
}

angular.module('materialscommons').component('mcAttributeNumber', {
    templateUrl: 'app/global.components/attribute/mc-attribute-number.html',
    controller: MCAttributeNumberComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
