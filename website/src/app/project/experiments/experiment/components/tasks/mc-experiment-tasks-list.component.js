/*
 ** This component has to add and remove classes to show visual state. This is an expensive
 ** operation when ng-class is used as angular will call the checks on ng-class many times.
 ** To get around this, the component adds and removes the classes itself by directly
 ** manipulating the DOM.
 */

angular.module('materialscommons').component('mcExperimentTasksList', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-tasks-list.html',
    controller: MCExperimentTasksListComponentController,
    bindings: {
        currentNode: '='
    },
    require: {
        experimentTasks: '^mcExperimentTasks'
    }
});

/*@ngInject*/
function MCExperimentTasksListComponentController(experimentsAPI, toast, $stateParams, mcprojstore) {
    let ctrl = this,
        projectId = $stateParams.project_id;
    ctrl.treeOptions = {
        dropped: onDrop
    };

    ctrl.experiment = mcprojstore.currentExperiment;

    ctrl.$onInit = () => {
        let treeModel = new TreeModel({childrenPropertyName: 'tasks'}),
            root = treeModel.parse(ctrl.experiment);
        root.walk((node) => {
            if (node.model.displayState) {
                node.model.displayState.selectedClass = '';
            }
        });
        ctrl.experiment.tasks[0].displayState.selectedClass = 'task-selected';
        ctrl.filterBy = ctrl.experimentTasks.filterBy;
    };

    function onDrop(event) {
        let srcIndex = event.source.index,
            dstTask = event.dest.nodesScope.$modelValue[srcIndex],
            task = event.source.nodeScope.$modelValue,
            srcTaskIndex = task.index;
        task.index = dstTask.index;
        if (srcIndex === dstTask.index) {
            return;
        }
        dstTask.index = srcTaskIndex;
        let swapArgs = {
            task_id: dstTask.id
        };
        experimentsAPI
            .updateTask(projectId, ctrl.experiment.id, task.id, {swap: swapArgs})
            .then(
                () => null,
                () => toast.error('Failed to update task')
            );
    }
}

angular.module('materialscommons').directive('mcExperimentTasksListDir', MCExperimentTasksListDirDirective);

/*@ngInject*/
function MCExperimentTasksListDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            task: '='
        },
        controller: MCExperimentTasksListDirDirectiveController,
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-tasks-list-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    }
}

/*@ngInject*/
function MCExperimentTasksListDirDirectiveController($stateParams, toast, mcstate, projectsAPI,
                                                     blankTaskService, taskService, mcprojstore) {
    let ctrl = this;
    ctrl.setCurrent = setCurrent;
    ctrl.experiment = mcprojstore.currentExperiment;

    function setCurrent(node, event) {
        $('.mc-experiment-outline-task').removeClass('task-selected');
        $(event.currentTarget).addClass('task-selected');
        mcstate.set(mcstate.CURRENT$TASK, ctrl.task);
        mcstate.set(mcstate.CURRENT$NODE, node);
        loadTaskTemplate();
        // log(ctrl.task);
    }

    function loadTaskTemplate() {
        if (!ctrl.task.loaded && ctrl.task.process_id !== '') {
            projectsAPI.getProjectProcess($stateParams.project_id, ctrl.task.process_id)
                .then(
                    (process) => {
                        ctrl.task.template = process;
                        let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                        ctrl.task.template.template_name = templateName;
                        ctrl.task.template_name = templateName;
                        ctrl.task.loaded = true;
                    },
                    () => toast.error('Unable to retrieve task template')
                );
        }
    }

    ctrl.toggleFlag = (whichFlag, event) => taskService.toggleFlag(whichFlag, event, ctrl.task);

    ctrl.toggleStar = (event) => taskService.toggleStar(event, ctrl.task);

    ctrl.onNameChange = () => taskService.updateName(ctrl.task);

    ctrl.updateDoneStatus = () => taskService.updateDoneStatus(ctrl.task);

    ctrl.toggleOpenDetails = (event) => {
        ctrl.task.displayState.open = !ctrl.task.displayState.open;
        ctrl.task.displayState.details.loadEditor = false;
        if (ctrl.task.displayState.open) {
            $(event.target).removeClass('fa-angle-double-right');
            $(event.target).addClass('fa-angle-double-down');
        } else {
            $(event.target).removeClass('fa-angle-double-down');
            $(event.target).addClass('fa-angle-double-right');
        }
    };

    ctrl.addBlankTask = (node) => {
        blankTaskService.addBlankTask(node, ctrl.task);
    };

    ctrl.remove = (node) => {
        ctrl.task.deleted = true;
        taskService.remove(node, ctrl.task, ctrl.experiment.tasks);
    };

    ctrl.addToExperimentNote = () => {
        let html = `
            <p>&nbsp;</p>
            <p>${ctrl.task.name}</p>
        `;

        ctrl.experiment.notes = ctrl.experiment.notes + html;
    };
}
