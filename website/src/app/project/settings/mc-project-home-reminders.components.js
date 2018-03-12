class MCProjectHomeRemindersComponentController {
    /*@ngInject*/
    constructor(projectsAPI, mcprojstore) {
        this.projectsAPI = projectsAPI;
        this.mcprojstore = mcprojstore;
    }

    removeReminder(index) {
        this.project.reminders.splice(index, 1);
        this.projectsAPI.updateProject(this.project.id, {reminders: this.project.reminders}).then(
            () => {
                this.mcprojstore.updateCurrentProject((currentProj) => {
                    currentProj.reminders = this.project.reminders;
                    return currentProj;
                });
            }
        );
    }

    addReminder() {
        this.project.reminders.push({note: '', status: 'none'});
    }

    updateReminders() {
        this.projectsAPI.updateProject(this.project.id, {reminders: this.project.reminders}).then(
            () => {
                this.mcprojstore.updateCurrentProject((currentProj) => {
                    currentProj.reminders = this.project.reminders;
                    return currentProj;
                });
            }
        );
    }
}

angular.module('materialscommons').component('mcProjectHomeReminders', {
    templateUrl: 'app/project/home/mc-project-home-reminders.html',
    controller: MCProjectHomeRemindersComponentController,
    bindings: {
        project: '<'
    }
});
