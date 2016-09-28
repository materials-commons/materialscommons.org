angular.module('materialscommons').factory('toUITask', toUITaskService);

/*@ngInject*/
function toUITaskService() {
    return function(task) {
        task.displayState = {
            details: {
                showNotes: true,
                showFiles: false,
                showSamples: false,
                currentFilesTab: 0,
                currentSamplesTab: 0,
                loadEditor: false
            },
            flags: {
                starredClass: task.flags.starred ? 'fa-star' : 'fa-star-o',
                flaggedClass: task.flags.flagged ? 'mc-flagged-color' : 'mc-flag-not-set'
            },
            selectedClass: '',
            editTitle: true,
            open: false,
            maximize: false
        };
        task.loaded = false;
        task.node = null;
    }
}