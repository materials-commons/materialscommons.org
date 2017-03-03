class MCProjectsListComponentController {
    /*@ngInject*/
    constructor($mdEditDialog, mcshow) {
        this.$mdEditDialog = $mdEditDialog;
        this.mcshow = mcshow;
        this.sortOrder = 'name';
    }

    editStatusNote(event, project, index) {
        event.stopPropagation();
        this.$mdEditDialog.small({
            modelValue: project.status_notes[index].note,
            placeholder: 'Add status message...',
            save: function(input) {
                project.status_notes[index].note = input.$modelValue;
                project.update({status_notes: project.status_notes});
            },
            targetEvent: event
        });
    };

    showProjectOverview(project) {
        this.mcshow.projectOverviewDialog(project);
    }
}

angular.module('materialscommons').component('mcProjectsList', {
    templateUrl: 'app/projects/mc-projects-list.html',
    controller: MCProjectsListComponentController,
    bindings: {
        projects: '<',
        query: '='
    }
});