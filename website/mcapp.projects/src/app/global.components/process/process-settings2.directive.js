angular.module('materialscommons').directive('processSettings2', processSettings2Directive);
function processSettings2Directive() {
    return {
        restrict: 'E',
        scope: {
            settings: '=',
            templateId: '=',
            attribute: '=',
            processId: '='
        },
        controller: ProcessSettings2DirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/global.components/process/process-settings2.html'
    }
}

/*@ngInject*/
function ProcessSettings2DirectiveController(experimentsService, toast, $stateParams) {

}
