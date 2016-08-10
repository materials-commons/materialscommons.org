angular.module('materialscommons').directive('processSettings2', processSettings2Directive);
function processSettings2Directive() {
    return {
        restrict: 'E',
        scope: {
            settings: '=',
            templateId: '=',
            attribute: '='
        },
        controller: ProcessSettings2DirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/global.components/process/process-settings2.html'
    }
}

/*@ngInject*/
function ProcessSettings2DirectiveController(experimentsService, toast, $stateParams) {
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

        if (property._type === "date") {
            console.dir(property);
            return;
        }

        property.setup_attribute = ctrl.attribute;
        let propertyArgs = {
            template_id: ctrl.templateId,
            properties: [property]
        };

        if (ctrl.taskId) {
            experimentsService.updateTaskTemplateProperties($stateParams.project_id, $stateParams.experiment_id, ctrl.taskId, propertyArgs)
                .then(
                    () => null,
                    () => toast.error('Unable to update property')
                );
        } else {
            console.log('Update process setting here');
        }
    };

    ///////////////////////////////////////

    function openDatePicker($event, prop) {
        $event.preventDefault();
        $event.stopPropagation();
        prop.opened = true;
    }
}