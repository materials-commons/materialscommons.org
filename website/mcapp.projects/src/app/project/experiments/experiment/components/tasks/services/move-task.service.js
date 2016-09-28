class MoveTaskService {
    /*@ngInject*/
    constructor(focus) {
        this.focus = focus;
    }

    static findCurrentTaskIndex(node, currentTask) {
        return _.findIndex(node.$parentNodesScope.$modelValue, (entry) => entry.id === currentTask.id);
    }

    static insertCurrentTaskBetween(list, currentTask, idToAddAfter) {
        let newList = [];
        if (!idToAddAfter) {
            // No id to add after, so add to first entry
            newList.push(currentTask);
        }
        for (let i = 0; i < list.length; i++) {
            newList.push(list[i]);
            if (list[i].id === idToAddAfter) {
                newList.push(currentTask);
            }
        }

        return newList;
    }

    left(currentNode, currentTask, experiment) {
        if (currentNode.depth() === 1) {
            // Top level node - it can't be out dented.
            return;
        }
        let index = MoveTaskService.findCurrentTaskIndex(currentNode, currentTask);

        // Get node to add after
        let nodeToAddAfter = currentNode.$parentNodeScope.$modelValue;
        let nodeToAddAt = null;
        if (!currentNode.$parentNodeScope.$parentNodeScope) {
            // At top, using experiment.
            nodeToAddAt = experiment;
        } else {
            nodeToAddAt = currentNode.$parentNodeScope.$parentNodeScope.$modelValue;
        }
        // Rebuild task list adding node we just moved left into its proper position
        nodeToAddAt.tasks = MoveTaskService.insertCurrentTaskBetween(nodeToAddAt.tasks, currentTask, nodeToAddAfter.id);

        //// Remove node from current list
        currentNode.$parentNodesScope.$modelValue.splice(index, 1);
        this.focus(currentTask.id);
    }

    right(currentNode, currentTask) {
        let index = MoveTaskService.findCurrentTaskIndex(currentNode, currentTask);
        if (currentNode.depth() === 1 && index === 0) {
            // First node at top level - it can't be indented.
            return;
        }

        // Remove node from current list and append it to the node above us in the list.
        let nodeToAddTo = currentNode.$parentNodesScope.$modelValue[index - 1];
        currentNode.$parentNodesScope.$modelValue.splice(index, 1);
        nodeToAddTo.tasks.push(currentTask);
        this.focus(currentTask.id)
    }

    up(currentNode, currentTask) {
        let index = MoveTaskService.findCurrentTaskIndex(currentNode, currentTask);
        if (index === 0) {
            // First entry, cannot move up
            return;
        }

        // Swap position of previous node and our node.
        let previousTask = currentNode.$parentNodesScope.$modelValue[index - 1];
        currentNode.$parentNodesScope.$modelValue[index] = previousTask;
        currentNode.$parentNodesScope.$modelValue[index - 1] = currentTask;
        this.focus(currentTask.id);
    }

    down(currentNode, currentTask, experiment) {
        let index = MoveTaskService.findCurrentTaskIndex(currentNode, currentTask);
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
        nodeToAddAt.tasks = MoveTaskService.insertCurrentTaskBetween(nodeToAddAt.tasks, currentTask, nodeToAddAfter.id);
        this.focus(currentTask.id);
    }
}

angular.module('materialscommons').service('moveTask', MoveTaskService);
