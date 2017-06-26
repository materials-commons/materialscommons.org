class MCProjectHomeRemindersComponentController {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    removeReminder(index) {
        this.project.reminders.splice(index, 1);
        this.projectsAPI.updateProject(this.project.id, {reminders: this.project.reminders});
    }

    addReminder() {
        this.project.reminders.push({note: '', status: 'none'});
    }

    updateReminders() {
        this.projectsAPI.updateProject(this.project.id, {reminders: this.project.reminders});
    }
}

angular.module('materialscommons').component('mcProjectHomeReminders', {
    templateUrl: 'app/project/home/mc-project-home-reminders.html',
    controller: MCProjectHomeRemindersComponentController,
    bindings: {
        project: '<'
    }
});
