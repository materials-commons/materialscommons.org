class ProcessSettings2NumberComponentController {
    /*@ngInject*/
    constructor(experimentsService, toast, $stateParams) {
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    updateSettingProperty(property) {
        //this.processId = '995298b0-4cbd-416b-af45-4e6da99a510e'
        //this.templateId = 'global_SEM'

        console.log('ProcessSettings2NumberComponentController')
        console.log('PS2N CC - setting:', this.setting);
        console.log('PS2N CC - projectId:', this.projectId);
        console.log('PS2N CC - experimentId:', this.experimentId);
        console.log('PS2N CC - templateId:', this.templateId);
        console.log('PS2N CC - attribute:', this.setting.attribute);
        console.log('PS2N CC - processId:', this.processId);
        console.log('PS2N CC - undateSettingProperty, property: ', property);

        if (!property.value) {
            console.log("No value -> ", property);
            return;
        }

        if (property.otype != "number") {
            console.log("Not a number -> ", property);
            return;
        }

        if (!property.units) {
            property.units = [];
        }

        if (property.units.length && !property.unit) {
            console.log("No unit -> ", property);
            return;
        }

        property.setup_attribute = this.attribute;
        let propertyArgs = {
            template_id: this.templateId,
            properties: [property]
        };

        console.log('PS2N CC - updateSettingProperty, propertyArgs: ', propertyArgs);

        this.experimentsService.updateProcess(this.projectId, this.experimentId, this.processId, propertyArgs)
            .then(
                () => null,
                () => this.toast.error('Unable to update property')
            );
    }
}

angular.module('materialscommons').component('processSettings2Number', {
    templateUrl: 'app/global.components/process/process-settings2-number.html',
    controller: ProcessSettings2NumberComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
