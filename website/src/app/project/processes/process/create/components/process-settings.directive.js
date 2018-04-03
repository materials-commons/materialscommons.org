angular.module('materialscommons').directive('processSettings', processSettingsDirective);
function processSettingsDirective() {
    return {
        restrict: 'E',
        scope: {
            settings: '=',
            taskId: '=',
            templateId: '=',
            attribute: '='
        },
        controller: ProcessSettingsDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        template: require('./process-settings.html')
    }
}

/*@ngInject*/
function ProcessSettingsDirectiveController(experimentsAPI, toast, $stateParams) {
    const ctrl = this,
        projectId = $stateParams.project_id,
        experimentId = $stateParams.experiment_id;

    ctrl.datePickerOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    ctrl.openDatePicker = openDatePicker;

    ctrl.updateSettingProperty = (property) => {
        if (!property.value) {
            return;
        }

        if (property.otype === "date") {
            return;
        }

        if (property.units.length && !property.unit) {
            return;
        }

        property.setup_attribute = ctrl.attribute;
        let propertyArgs = {
            template_id: ctrl.templateId,
            properties: [property]
        };

        if (ctrl.taskId) {
            experimentsAPI.updateTaskTemplateProperties(projectId, experimentId, ctrl.taskId, propertyArgs)
                .then(
                    () => null,
                    () => toast.error('Unable to update property')
                );
        } else {
            // log('Update process setting here');
        }
    };

    ///////////////////////////////////////

    function openDatePicker($event, prop) {
        $event.preventDefault();
        $event.stopPropagation();
        prop.opened = true;
    }
}
