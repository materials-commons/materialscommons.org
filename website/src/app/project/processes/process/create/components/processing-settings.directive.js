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
        templateUrl: 'app/project/processes/process/create/components/process-settings.html'
    }
}

/*@ngInject*/
function ProcessSettingsDirectiveController(experimentsService, toast, $stateParams) {
    var ctrl = this;
    ctrl.datePickerOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    ctrl.openDatePicker = openDatePicker;

    ctrl.updateSettingProperty = (property) => {
        if (!property.value) {
            return;
        }

        property.setup_attribute = ctrl.attribute;
        let propertyArgs = {
            template_id: ctrl.templateId,
            properties: [property]
        };
        experimentsService.updateTaskTemplateProperties($stateParams.project_id, $stateParams.experiment_id, ctrl.taskId, propertyArgs)
            .then(
                () => null,
                () => toast.error('Unable to update property')
            );
    };

    ///////////////////////////////////////

    function openDatePicker($event, prop) {
        $event.preventDefault();
        $event.stopPropagation();
        prop.opened = true;
    }
}