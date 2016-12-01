class ProcessSettings2StringComponentController {
    /*@ngInject*/
    constructor(experimentsService, toast, $stateParams) {
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSettingProperty(property) {

        console.log(this.projectId);
        console.log(this.experimentId);
        console.log(this.processId);
        console.log(this.templateId);
        console.log(this.attribute);

        console.log(property.value);
        console.log(property.otype);


        if (!property.value) {
            console.log("No value -> ", property);
            return;
        }

        if (property.otype != "string") {
            console.log("Not a string -> ", property);
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

angular.module('materialscommons').component('processSettings2String', {
    templateUrl: 'app/global.components/process/process-settings2-string.html',
    controller: ProcessSettings2StringComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
