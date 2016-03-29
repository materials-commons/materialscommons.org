class MoveStepService {
    /*@ngInject*/
    constructor(focus) {
        this.focus = focus;
    }

    static findCurrentStepIndex(node, currentStep) {
        return _.findIndex(node.$parentNodesScope.$modelValue, (entry) => entry.id === currentStep.id);
    }

    static insertCurrentStepBetween(list, currentStep, idToAddAfter) {
        let newList = [];
        if (!idToAddAfter) {
            // No id to add after, so add to first entry
            newList.push(currentStep);
        }
        for (let i = 0; i < list.length; i++) {
            newList.push(list[i]);
            if (list[i].id === idToAddAfter) {
                newList.push(currentStep);
            }
        }

        return newList;
    }

    left(currentNode, currentStep, experiment) {
        if (currentNode.depth() === 1) {
            // Top level node - it can't be out dented.
            return;
        }
        let index = MoveStepService.findCurrentStepIndex(currentNode, currentStep);

        // Get node to add after
        let nodeToAddAfter = currentNode.$parentNodeScope.$modelValue;
        let nodeToAddAt = null;
        if (!currentNode.$parentNodeScope.$parentNodeScope) {
            // At top, using experiment.
            nodeToAddAt = experiment;
        } else {
            nodeToAddAt = currentNode.$parentNodeScope.$parentNodeScope.$modelValue;
        }
        // Rebuild step list adding node we just moved left into its proper position
        nodeToAddAt.steps = MoveStepService.insertCurrentStepBetween(nodeToAddAt.steps, currentStep, nodeToAddAfter.id);

        //// Remove node from current list
        currentNode.$parentNodesScope.$modelValue.splice(index, 1);
        this.focus(currentStep.id);
    }

    right(currentNode, currentStep) {
        let index = MoveStepService.findCurrentStepIndex(currentNode, currentStep);
        if (currentNode.depth() === 1 && index === 0) {
            // First node at top level - it can't be indented.
            return;
        }

        // Remove node from current list and append it to the node above us in the list.
        let nodeToAddTo = currentNode.$parentNodesScope.$modelValue[index - 1];
        currentNode.$parentNodesScope.$modelValue.splice(index, 1);
        nodeToAddTo.steps.push(currentStep);
        this.focus(currentStep.id)
    }

    up(currentNode, currentStep) {
        let index = MoveStepService.findCurrentStepIndex(currentNode, currentStep);
        if (index === 0) {
            // First entry, cannot move up
            return;
        }

        // Swap position of previous node and our node.
        let previousStep = currentNode.$parentNodesScope.$modelValue[index - 1];
        currentNode.$parentNodesScope.$modelValue[index] = previousStep;
        currentNode.$parentNodesScope.$modelValue[index - 1] = currentStep;
        this.focus(currentStep.id);
    }

    down(currentNode, currentStep, experiment) {
        let index = MoveStepService.findCurrentStepIndex(currentNode, currentStep);
        if (index === currentNode.$parentNodesScope.$modelValue.length - 1) {
            // Last entry, cannot move up
            return;
        }

        // Node to add after
        let nodeToAddAfter = currentNode.$parentNodesScope.$modelValue[index + 1];
        // Remove node from list
        currentNode.$parentNodesScope.$modelValue.splice(index, 1);

        let nodeToAddAt = experiment;
        if (currentNode.$parentNodeScope) {
            nodeToAddAt = currentNode.$parentNodeScope.$modelValue;
        }
        nodeToAddAt.steps = MoveStepService.insertCurrentStepBetween(nodeToAddAt.steps, currentStep, nodeToAddAfter.id);
        this.focus(currentStep.id);
    }
}

angular.module('materialscommons').service('moveStep', MoveStepService);
