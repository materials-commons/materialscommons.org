import {ExperimentStep} from './experiment';

angular.module('materialscommons').component('mcExperimentOutline', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment-outline.html',
    controller: MCExperimentOutlineComponentController,
    bindings: {
        experiment: '=',
        currentStep: '=',
        currentNode: '='
    }
});

/*@ngInject*/
function MCExperimentOutlineComponentController(focus, toastr) {
    let lastID = 1;
    let ctrl = this;
    ctrl.setCurrent = setCurrent;
    ctrl.addBlankStep = addBlankStep;
    ctrl.remove = remove;

    function setCurrent(step, node) {
        ctrl.currentStep = step;
        ctrl.currentNode = node;
    }

    function addBlankStep(node) {
        let newStep = new ExperimentStep('', '');
        newStep.id = "simple" + lastID;
        lastID++;
        node.$parentNodesScope.$modelValue.push(newStep);
        ctrl.currentStep = newStep;
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
