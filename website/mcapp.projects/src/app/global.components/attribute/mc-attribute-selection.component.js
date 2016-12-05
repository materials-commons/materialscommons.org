class MCAttributeSelectionComponentController {
    /*@ngInject*/
    constructor(experimentsService, toast, $stateParams) {
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSelectionSettingProperty(property) {

        if (!property.value) {
            console.log("No value -> ", property);
            return;
        }

        if (property.otype != "selection") {
            console.log("Not a selection -> ", property);
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

angular.module('materialscommons').component('mcAttributeSelection', {
    templateUrl: 'app/global.components/attribute/mc-attribute-selection.html',
    controller: MCAttributeSelectionComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
