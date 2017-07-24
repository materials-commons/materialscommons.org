class MCAttributeCompositionComponentController {
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

        if (property.otype != "composition") {
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

angular.module('materialscommons').component('mcAttributeComposition', {
    templateUrl: 'app/global.components/attribute/mc-attribute-composition.html',
    controller: MCAttributeCompositionComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
