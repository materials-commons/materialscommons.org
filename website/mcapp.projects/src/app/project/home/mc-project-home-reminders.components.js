class MCProjectHomeRemindersComponentController {
    /*@ngInject*/
    constructor() {
    }

    removeReminder(index) {
        this.project.reminders.splice(index, 1);
    }

    addReminder() {
        this.project.reminders.push({note: '', status: 'none'});
    }

    updateReminders() {
        this.project.update({reminders: this.project.reminders});
    }
}

angular.module('materialscommons').component('mcProjectHomeReminders', {
    templateUrl: 'app/project/home/mc-project-home-reminders.html',
    controller: MCProjectHomeRemindersComponentController,
    bindings: {
        project: '<'
    }
});
