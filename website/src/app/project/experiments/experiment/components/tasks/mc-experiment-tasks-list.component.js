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
        experiment: '=',
        currentNode: '='
    }
});

/*@ngInject*/
function MCExperimentTasksListComponentController(experimentsService, toast, $stateParams) {
    let ctrl = this;
    ctrl.treeOptions = {
        dropped: onDrop
    };

    ctrl.$onInit = () => {
        var treeModel = new TreeModel({childrenPropertyName: 'steps'}),
            root = treeModel.parse(ctrl.experiment);
        root.walk((node) => {
            if (node.model.displayState) {
                node.model.displayState.selectedClass = '';
            }
        });
        ctrl.experiment.steps[0].displayState.selectedClass = 'step-selected';
    };

    function onDrop(event) {
        let srcIndex = event.source.index,
            dstStep = event.dest.nodesScope.$modelValue[srcIndex],
            step = event.source.nodeScope.$modelValue,
            srcStepIndex = step.index;
        step.index = dstStep.index;
        dstStep.index = srcStepIndex;
        let swapArgs = {
            step_id: dstStep.id
        };
        experimentsService
            .updateStep($stateParams.project_id, $stateParams.experiment_id, step.id, {swap: swapArgs})
            .then(
                () => null,
                () => toast.error('Failed to update step')
            );

    }
}

angular.module('materialscommons').directive('mcExperimentTasksListDir', MCExperimentTasksListDirDirective);

/*@ngInject*/
function MCExperimentTasksListDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            step: '='
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
                                                     currentStep, toUIStep, focus, currentExperiment,
                                                     paginationService) {
    let ctrl = this;
    ctrl.setCurrent = setCurrent;
    ctrl.experiment = currentExperiment.get();

    function setCurrent(node, event) {
        $('.mc-experiment-outline-step').removeClass('step-selected');
        $(event.currentTarget).addClass('step-selected');
        //ctrl.currentStep = step;
        currentStep.set(ctrl.step);
        //ctrl.currentNode = node;
    }

    ctrl.toggleFlag = (whichFlag, event) => {
        // toggle flag and then get its value so we know
        // what classes to add/remove.
        ctrl.step.flags[whichFlag] = !ctrl.step.flags[whichFlag];
        let flagColorClass = 'mc-' + whichFlag + '-color';
        let flag = ctrl.step.flags[whichFlag];
        if (flag) {
            // Toggled to on, remove dark grey and add in class for specific flag
            ctrl.step.displayState.flags[whichFlag + 'Class'] = flagColorClass;
            $(event.target).removeClass('mc-flag-not-set');
            $(event.target).addClass(flagColorClass);
        } else {
            ctrl.step.displayState.flags[whichFlag + 'Class'] = 'mc-flag-not-set';
            $(event.target).removeClass(flagColorClass);
            $(event.target).addClass('mc-flag-not-set');
        }

        experimentsService
            .updateStep($stateParams.project_id, $stateParams.experiment_id, ctrl.step.id, {flags: ctrl.step.flags})
            .then(
                () => null,
                () => toast.error('Failed to update step')
            );
    };

    ctrl.onNameChange = () => {
        experimentsService
            .updateStep($stateParams.project_id, $stateParams.experiment_id, ctrl.step.id, {name: ctrl.step.name})
            .then(
                () => null,
                () => toast.error('Failed to update step')
            );
    };

    ctrl.updateDoneStatus = () => {
        experimentsService
            .updateStep($stateParams.project_id, $stateParams.experiment_id, ctrl.step.id, {flags: ctrl.step.flags})
            .then(
                () => null,
                () => toast.error('Failed to update step')
            );
    };

    ctrl.toggleOpenDetails = (event) => {
        ctrl.step.displayState.open = !ctrl.step.displayState.open;
        ctrl.step.displayState.details.loadEditor = false;
        if (ctrl.step.displayState.open) {
            $(event.target).removeClass('fa-angle-double-right');
            $(event.target).addClass('fa-angle-double-down');
        } else {
            $(event.target).removeClass('fa-angle-double-down');
            $(event.target).addClass('fa-angle-double-right');
        }
    };

    ctrl.addBlankStep = (node) => {
        let csi = findCurrentStepIndex(node);

        let newStep = {
            name: '',
            description: '',
            parent_id: '',
            index: csi + 1
        };
        experimentsService.createStep($stateParams.project_id, $stateParams.experiment_id, newStep)
            .then(
                (step) => {
                    $('.mc-experiment-outline-step').removeClass('step-selected');
                    ctrl.step.displayState.selectedClass = '';
                    toUIStep(step);
                    step.displayState.selectedClass = 'step-selected';
                    node.$nodeScope.$parentNodesScope.$modelValue.splice(csi + 1, 0, step);
                    currentStep.set(step);
                    gotoNewTasksPage(csi);
                    focus(step.id);
                },
                () => toast.error('Unable to create new step')
            );
    };

    function findCurrentStepIndex(node) {
        return _.findIndex(node.$nodeScope.$parentNodesScope.$modelValue, (n) => n.id === ctrl.step.id);
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
        if (node.$nodeScope.depth() === 1 && ctrl.experiment.steps.length === 1) {
            toast.error('Cannot remove last step');
            return;
        }

        experimentsService.deleteStep($stateParams.project_id, $stateParams.experiment_id, ctrl.step.id)
            .then(
                () => node.$nodeScope.remove(),
                () => toast.error('Unable to delete task')
            );
    };

    ctrl.addToExperimentNote = () => {
        let html = `
            <p>&nbsp;</p>
            <p>${ctrl.step.name}</p>
        `;

        ctrl.experiment.notes = ctrl.experiment.notes + html;
    };
}
