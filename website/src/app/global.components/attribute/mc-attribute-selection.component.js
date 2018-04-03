class MCAttributeSelectionComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, toast, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSelectionSettingProperty(property) {

        if (!property.value) {
            return;
        }

        if (property.otype != "selection") {
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
}

angular.module('materialscommons').component('mcAttributeSelection', {
    template: require('./mc-attribute-selection.html'),
    controller: MCAttributeSelectionComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
