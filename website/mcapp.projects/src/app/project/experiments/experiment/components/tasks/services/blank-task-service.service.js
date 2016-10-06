class BlankTaskService {
    /*@ngInject*/
    constructor(toUITask, focus, currentTask, paginationService, experimentsService, toast, $stateParams, currentExperiment) {
        this.toUITask = toUITask;
        this.focus = focus;
        this.currentTask = currentTask;
        this.paginationService = paginationService;
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.currentExperiment = currentExperiment;
    }

    addBlankTask(node, currentlySelectedTask) {
        let csi = node == null ? 1 : this.findCurrentTaskIndex(node, currentlySelectedTask);
        let experiment = this.currentExperiment.get();
        let tasks = experiment.tasks;

        let newTask = {
            name: '',
            note: '',
            parent_id: '',
            index: csi + 1
        };
        this.experimentsService.createTask(this.$stateParams.project_id, this.$stateParams.experiment_id, newTask)
            .then(
                (task) => {
                    $('.mc-experiment-outline-task').removeClass('task-selected');
                    if (currentlySelectedTask) {
                        currentlySelectedTask.displayState.selectedClass = '';
                    }
                    this.toUITask(task);
                    task.displayState.selectedClass = 'task-selected';
                    if (node === null) {
                        tasks.splice(csi + 1, 0, task);
                    } else {
                        node.$nodeScope.$parentNodesScope.$modelValue.splice(csi + 1, 0, task);
                    }
                    this.currentTask.set(task);
                    this.gotoNewTasksPage(csi);
                    this.focus(task.id);
                },
                () => this.toast.error('Unable to create new task')
            );
    }

    findCurrentTaskIndex(node, task) {
        return _.findIndex(node.$nodeScope.$parentNodesScope.$modelValue, (n) => n.id === task.id);
    }

    gotoNewTasksPage(taskIndex) {
        let instanceId = this.paginationService.getLastInstanceId();
        let currentPage = this.paginationService.getCurrentPage(instanceId);
        let itemsPerPage = this.paginationService.getItemsPerPage(instanceId);
        let remainder = (taskIndex + 1) % itemsPerPage;
        if (!remainder) {
            // On a page boundary, so new item will be created on the next page.
            // Switch to that page.
            this.paginationService.setCurrentPage(instanceId, currentPage + 1);
        }
    }
}

angular.module('materialscommons').service('blankTaskService', BlankTaskService);