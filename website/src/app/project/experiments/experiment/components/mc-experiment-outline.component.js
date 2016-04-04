import {ExperimentStep} from '../experiment.model';

angular.module('materialscommons').component('mcExperimentOutline', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-outline.html',
    controller: MCExperimentOutlineComponentController,
    bindings: {
        experiment: '=',
        currentNode: '='
    }
});

/*@ngInject*/
function MCExperimentOutlineComponentController(focus, toastr, currentStep) {
    let lastID = 1;
    let ctrl = this;
    ctrl.editorOptions = {
        height: '55vh',
        width: '90vw'
    };
    ctrl.currentStep = currentStep.get();
    ctrl.setCurrent = setCurrent;
    ctrl.addBlankStep = addBlankStep;
    ctrl.remove = remove;

    function setCurrent(step, node) {
        if (ctrl.currentStep !== step) {
            ctrl.currentStep.displayState.editTitle = false;
        }
        ctrl.currentStep = step;
        currentStep.set(step);
        ctrl.currentNode = node;
    }

    function addBlankStep(node) {
        let newStep = new ExperimentStep('', '');
        newStep.id = "simple" + lastID;
        lastID++;
        node.$parentNodesScope.$modelValue.push(newStep);
        ctrl.currentStep = newStep;
        currentStep.set(newStep);
        focus(newStep.id);
    }

    function remove(node) {
        if (node.depth() === 1 && ctrl.experiment.steps.length === 1) {
            toastr.error('Cannot remove last step', 'Error', {closeButton: true});
            return;
        }
        if (node.$modelValue == ctrl.currentStep) {
            ctrl.currentStep = null;
        }
        node.remove();
    }
}
