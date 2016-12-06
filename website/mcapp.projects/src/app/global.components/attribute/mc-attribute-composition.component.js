class MCAttributeCompositionComponentController {
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
            console.log("No value -> ", property);
            return;
        }

        if (property.otype != "composition") {
            console.log("Not a composition -> ", property);
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
