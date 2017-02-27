class TaskService {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams, toast, projectsAPI) {
        this.experimentsAPI = experimentsAPI;
        this.$stateParams = $stateParams;
        this.toast = toast;
        this.projectsAPI = projectsAPI;
    }

    toggleFlag(whichFlag, event, task) {
        // toggle flag and then get its value so we know
        // what classes to add/remove.
        task.flags[whichFlag] = !task.flags[whichFlag];
        let flagColorClass = 'mc-' + whichFlag + '-color';
        let flag = task.flags[whichFlag];
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        if (flag) {
            // Toggled to on, remove dark grey and add in class for specific flag
            task.displayState.flags[whichFlag + 'Class'] = flagColorClass;
            $(event.target).removeClass('mc-flag-not-set');
            $(event.target).addClass(flagColorClass);
        } else {
            task.displayState.flags[whichFlag + 'Class'] = 'mc-flag-not-set';
            $(event.target).removeClass(flagColorClass);
            $(event.target).addClass('mc-flag-not-set');
        }

        this.experimentsAPI
            .updateTask(projectId, experimentId, task.id, {flags: task.flags})
            .then(
                () => null,
                () => this.toast.error('Failed to update task')
            );
    }

    toggleStar(event, task) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        if (task.flags.starred) {
            $(event.target).removeClass('fa-star');
            $(event.target).addClass('fa-star-o');
            task.displayState.flags.starredClass = 'fa-star-o';
            task.flags.starred = false;
        } else {
            $(event.target).removeClass('fa-star-o');
            $(event.target).addClass('fa-star');
            task.displayState.flags.starredClass = 'fa-star';
            task.flags.starred = true;
        }

        this.experimentsAPI
            .updateTask(projectId, experimentId, task.id, {flags: task.flags})
            .then(
                () => null,
                () => this.toast.error('Failed to update task')
            );
    }

    updateName(task) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        this.experimentsAPI
            .updateTask(projectId, experimentId, task.id, {name: task.name})
            .then(
                () => null,
                () => this.toast.error('Failed to update task')
            );
    }

    updateDoneStatus(task) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        this.experimentsAPI
            .updateTask(projectId, experimentId, task.id, {flags: task.flags})
            .then(
                () => null,
                () => this.toast.error('Failed to update task')
            );
    }

    updateNote(task) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;

        if (task.deleted) {
            return;
        }

        if (task.note === null) {
            return;
        }

        this.experimentsAPI.updateTask(projectId, experimentId, task.id, {note: task.note})
            .then(
                () => null,
                () => this.toast.error('Unable to update task note.')
            );
    }

    remove(node, task, tasks) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        if (node.$nodeScope.depth() === 1 && tasks.length === 1) {
            this.toast.error('Cannot remove last task');
            return;
        }

        this.experimentsAPI.deleteTask(projectId, experimentId, task.id)
            .then(
                () => node.$nodeScope.remove(),
                (err) => this.toast.error(`Unable to delete task: ${err.data.error}`)
            );
    }

    setTemplate(templateId, processId, task) {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id;
        this.experimentsAPI.addTemplateToTask(projectId, experimentId, task.id, `global_${templateId}`)
            .then(
                (template) => {
                    this.projectsAPI.getProjectProcess(projectId, template.process_id).then(
                        (process) => {
                            task.template = process;
                            let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                            task.template.template_name = templateName;
                            task.template_name = templateName;
                            task.template.template_id = process.template_id;
                            task.loaded = true;
                        }
                    );
                },
                () => this.toast.error('Unable to associate template with task')
            );
    }
}

angular.module('materialscommons').service('taskService', TaskService);
