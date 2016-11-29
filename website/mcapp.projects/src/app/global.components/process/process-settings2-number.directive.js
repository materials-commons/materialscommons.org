angular.module('materialscommons').directive('processSettings2Number', processSettings2NumberDirective);
function processSettings2NumberDirective() {
    return {
        restrict: 'E',
        scope: {
            settings: '=',
            templateId: '=',
            attribute: '=',
            processId: '='
        },
        controller: ProcessSettings2NumberDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/global.components/process/process-settings2-number.html'
    }
}

/*@ngInject*/
function ProcessSettings2NumberDirectiveController(experimentsService, toast, $stateParams) {
    var ctrl = this;

    console.log('ctrl.setting for number ', ctrl.setting);
    console.log('ctrl.templateId: ', ctrl.templateId);
    console.log('ctrl.attribute: ', ctrl.attribute);
    console.log('ctrl.processId: ', ctrl.processId);


    ctrl.updateSettingProperty = (property) => {
        console.log('number undateSettingProperty, property: ', property);
        if (!property.value) {
            console.log("No value -> ", property);
            return;
        }

        if (property.otype != "number") {
            console.log("Not a number -> ", property);
            return;
        }

        if (property.units.length && !property.unit) {
            console.log("No units/unit -> ", property);
            return;
        }

        property.setup_attribute = ctrl.attribute;
        let propertyArgs = {
            template_id: ctrl.templateId,
            properties: [property]
        };

        experimentsService.updateProcess($stateParams.project_id, $stateParams.experiment_id, ctrl.processId, propertyArgs)
            .then(
                () => null,
                () => toast.error('Unable to update property')
            );
    };

}
