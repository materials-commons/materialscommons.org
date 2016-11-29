class ProcessSettings2NumberComponentController {
    /*@ngInject*/
    constructor(experimentsService, toast, $stateParams) {
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        console.log('ProcessSettings2NumberComponentController, constructor')
    }

    updateSettingProperty(property) {
        console.log('ProcessSettings2NumberComponentController')
        console.log('PS2N CC - setting:', this.setting);
        console.log('PS2N CC - templateId:', this.templateId);
        console.log('PS2N CC - attribute:', this.attribute);
        console.log('PS2N CC - processId:', this.processId);
        console.log('PS2N CC - processId:', this.projectId);
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

        console.log('PS2N CC - undateSettingProperty, propertyArgs: ', propertyArgs);

        this.experimentsService.updateProcess(this.project_id, this.$stateParams.experiment_id, this.processId, propertyArgs)
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
