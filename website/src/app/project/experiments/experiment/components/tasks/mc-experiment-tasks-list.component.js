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
function MCExperimentTasksListComponentController(experimentsService, toast, $stateParams, currentExperiment) {
    let ctrl = this;
    ctrl.treeOptions = {
        dropped: onDrop
    };

    ctrl.experiment = currentExperiment.get();

    ctrl.$onInit = () => {
        var treeModel = new TreeModel({childrenPropertyName: 'tasks'}),
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
        dstTask.index = srcTaskIndex;
        let swapArgs = {
            task_id: dstTask.id
        };
        experimentsService
            .updateTask($stateParams.project_id, $stateParams.experiment_id, task.id, {swap: swapArgs})
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
function MCExperimentTasksListDirDirectiveController($stateParams, experimentsService, toast,
                                                     currentTask, toUITask, focus, currentExperiment,
                                                     paginationService, projectsService, templates,
                                                     processEdit) {
    let ctrl = this;
    ctrl.setCurrent = setCurrent;
    ctrl.experiment = currentExperiment.get();

    function setCurrent(node, event) {
        $('.mc-experiment-outline-task').removeClass('task-selected');
        $(event.currentTarget).addClass('task-selected');
        currentTask.set(ctrl.task);
        loadTaskTemplate();
        console.dir(ctrl.task);
    }

    function loadTaskTemplate() {
        if (!ctrl.task.loaded && ctrl.task.process_id !== '') {
            projectsService.getProjectProcess($stateParams.project_id, ctrl.task.process_id)
                .then(
                    (process) => {
                        let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                        var t = templates.getTemplate(templateName);
                        ctrl.task.template = processEdit.fillProcess(t, process);
                        ctrl.task.template.template_name = templateName;
                        ctrl.task.loaded = true;
                    },
                    () => toast.error('Unable to retrieve task template')
                );
        }
    }

    ctrl.toggleFlag = (whichFlag, event) => {
        // toggle flag and then get its value so we know
        // what classes to add/remove.
        ctrl.task.flags[whichFlag] = !ctrl.task.flags[whichFlag];
        let flagColorClass = 'mc-' + whichFlag + '-color';
        let flag = ctrl.task.flags[whichFlag];
        if (flag) {
            // Toggled to on, remove dark grey and add in class for specific flag
            ctrl.task.displayState.flags[whichFlag + 'Class'] = flagColorClass;
            $(event.target).removeClass('mc-flag-not-set');
            $(event.target).addClass(flagColorClass);
        } else {
            ctrl.task.displayState.flags[whichFlag + 'Class'] = 'mc-flag-not-set';
            $(event.target).removeClass(flagColorClass);
            $(event.target).addClass('mc-flag-not-set');
        }

        experimentsService
            .updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id, {flags: ctrl.task.flags})
            .then(
                () => null,
                () => toast.error('Failed to update task')
            );
    };

    ctrl.toggleStar = (event) => {
        if (ctrl.task.flags.starred) {
            $(event.target).removeClass('fa-star');
            $(event.target).addClass('fa-star-o');
            ctrl.task.displayState.flags.starredClass = 'fa-star-o';
            ctrl.task.flags.starred = false;
        } else {
            $(event.target).removeClass('fa-star-o');
            $(event.target).addClass('fa-star');
            ctrl.task.displayState.flags.starredClass = 'fa-star';
            ctrl.task.flags.starred = true;
        }

        experimentsService
            .updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id, {flags: ctrl.task.flags})
            .then(
                () => null,
                () => toast.error('Failed to update task')
            );
    };

    ctrl.onNameChange = () => {
        experimentsService
            .updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id, {name: ctrl.task.name})
            .then(
                () => null,
                () => toast.error('Failed to update task')
            );
    };

    ctrl.updateDoneStatus = () => {
        experimentsService
            .updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id, {flags: ctrl.task.flags})
            .then(
                () => null,
                () => toast.error('Failed to update task')
            );
    };

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
        let csi = findCurrentTaskIndex(node);

        let newTask = {
            name: '',
            note: '',
            parent_id: '',
            index: csi + 1
        };
        experimentsService.createTask($stateParams.project_id, $stateParams.experiment_id, newTask)
            .then(
                (task) => {
                    $('.mc-experiment-outline-task').removeClass('task-selected');
                    ctrl.task.displayState.selectedClass = '';
                    toUITask(task);
                    task.displayState.selectedClass = 'task-selected';
                    node.$nodeScope.$parentNodesScope.$modelValue.splice(csi + 1, 0, task);
                    currentTask.set(task);
                    gotoNewTasksPage(csi);
                    focus(task.id);
                },
                () => toast.error('Unable to create new task')
            );
    };

    function findCurrentTaskIndex(node) {
        return _.findIndex(node.$nodeScope.$parentNodesScope.$modelValue, (n) => n.id === ctrl.task.id);
    }

    function gotoNewTasksPage(taskIndex) {
        let instanceId = paginationService.getLastInstanceId();
        let currentPage = paginationService.getCurrentPage(instanceId);
        let itemsPerPage = paginationService.getItemsPerPage(instanceId);
        let remainder = (taskIndex + 1) % itemsPerPage;
        if (!remainder) {
            // On a page boundary, so new item will be created on the next page.
            // Switch to that page.
            paginationService.setCurrentPage(instanceId, currentPage + 1);
        }
    }

    ctrl.remove = (node) => {
        if (node.$nodeScope.depth() === 1 && ctrl.experiment.tasks.length === 1) {
            toast.error('Cannot remove last task');
            return;
        }

        experimentsService.deleteTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id)
            .then(
                () => node.$nodeScope.remove(),
                () => toast.error('Unable to delete task')
            );
    };

    ctrl.addToExperimentNote = () => {
        let html = `
            <p>&nbsp;</p>
            <p>${ctrl.task.name}</p>
        `;

        ctrl.experiment.notes = ctrl.experiment.notes + html;
    };
}
