angular.module('materialscommons').component('mcExperimentTasks', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-tasks.html',
    controller: MCExperimentTasksComponentController
});

/*@ngInject*/
function MCExperimentTasksComponentController($scope, moveTask, currentTask, currentExperiment) {
    let ctrl = this;
    ctrl.show = 'note';

    ctrl.filterBy = {flags: {done: false}};

    ctrl.$onInit = () => {
        ctrl.currentNode = null;
        ctrl.experiment = currentExperiment.get();
        ctrl.experiment.tasks[0].displayState.selectedClass = 'task-selected';
        currentTask.set(ctrl.experiment.tasks[0]);
        ctrl.currentTask = currentTask.get();
        currentTask.setOnChange(() => ctrl.currentTask = currentTask.get());
    };

    ctrl.toggleFilter = (filter, event) => {
        let setFlag = false;
        if (_.has(ctrl.filterBy.flags, filter)) {
            // The done flag is treated specially as, by default, we don't show
            // done items.
            if (filter === 'done') {
                ctrl.filterBy.flags.done = !ctrl.filterBy.flags.done;
                setFlag = ctrl.filterBy.flags.done;
            } else {
                delete ctrl.filterBy.flags[filter];
            }
        } else {
            setFlag = true;
            ctrl.filterBy.flags[filter] = true;
        }

        switch (filter) {
            case "done":
                toggleFilterIcon(setFlag, event, 'fa-check-square', 'fa-check-square-o');
                break;
            case "starred":
                toggleFilterIcon(setFlag, event, 'fa-star', 'fa-star-o');
                break;
            case "flagged":
                toggleFilterIcon(setFlag, event, 'fa-flag', 'fa-flag-o');
                break;
        }
    };

    function toggleFilterIcon(isSet, event, setClass, unsetClass) {
        if (isSet) {
            $(event.target).removeClass(unsetClass);
            $(event.target).addClass(setClass);
        } else {
            $(event.target).removeClass(setClass);
            $(event.target).addClass(unsetClass);
        }
    }

    ctrl.moveLeft = () => moveTask.left(ctrl.currentNode, currentTask.get(), ctrl.experiment);
    ctrl.moveRight = () => moveTask.right(ctrl.currentNode, currentTask.get());
    ctrl.moveUp = () => moveTask.up(ctrl.currentNode, currentTask.get());
    ctrl.moveDown = () => moveTask.down(ctrl.currentNode, currentTask.get(), ctrl.experiment);
    ctrl.expandAll = () => $scope.$broadcast('angular-ui-tree:expand-all');
    ctrl.collapseAll = () => $scope.$broadcast('angular-ui-tree:collapse-all');
    ctrl.showTaskMaximized = () => {
        if (!currentTask.get()) {
            return false;
        }
        return currentTask.get().displayState.maximize;
    };
    ctrl.openAll = openAll;
    ctrl.closeAll = closeAll;
    ctrl.getCurrentTask = () => currentTask.get();

    function openAll() {
        var treeModel = new TreeModel({childrenPropertyName: 'tasks'}),
            root = treeModel.parse(ctrl.experiment);
        //ctrl.experiment.tasks.forEach((task) => task.displayState.open = true);
    }

    function closeAll() {
        //ctrl.experiment.tasks.forEach((task) => task.displayState.open = false);
    }
}

