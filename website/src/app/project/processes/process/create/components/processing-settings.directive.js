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

    // Set default value on selections to first choice.
    ctrl.settings.forEach(function(setting) {
        // selection type
        if (setting.property._type === 'selection') {
            setting.property.value = setting.property.choices[0];
        } else if (setting.property._type === 'date') {
            setting.property.opened = false;
        }

        // unit selections
        if (setting.property.units.length !== 0) {
            setting.property.unit = setting.property.units[0];
        }
    });

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