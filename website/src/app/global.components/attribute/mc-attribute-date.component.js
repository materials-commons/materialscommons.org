class MCAttributeDateComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, toast, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datePickerOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        if (this.setting.value) {
            this.date = new Date(this.setting.value);
        } else {
            this.date = new Date();
        }
    }

    openDatePicker($event, prop) {
        $event.preventDefault();
        $event.stopPropagation();
        prop.opened = true;
    }

    updateDateProperty(property) {

        property.value =
            this.experimentsAPI.convertDateValueForTransport(this.date);

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

angular.module('materialscommons').component('mcAttributeDate', {
    template: require('./mc-attribute-date.html'),
    controller: MCAttributeDateComponentController,
    bindings: {
        setting: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    }
});
