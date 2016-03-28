angular.module('materialscommons').component('mcExperimentOutlineSimpleView', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment-outline-simple-view.html',
    controller: MCExperimentOutlineSimpleViewComponentController,
    bindings: {
        experiment: '=',
        currentStep: '=',
        selectedStep: '='
    }
});

/*@ngInject*/
function MCExperimentOutlineSimpleViewComponentController() {
    let ctrl = this;
    ctrl.toggleSelected = toggleSelected;

    function toggleSelected(step) {
        ctrl.currentStep = step;
        if (ctrl.selectedStep && ctrl.selectedStep === step) {
            step.selected = false;
            ctrl.selectedStep = null;
            return;
        }

        if (ctrl.selectedStep && ctrl.selectedStep !== step) {
            ctrl.selectedStep.selected = false;
        }
        step.selected = true;
        ctrl.selectedStep = step;
    }
}
