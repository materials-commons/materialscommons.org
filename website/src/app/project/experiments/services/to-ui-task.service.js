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
                errorClass: task.flags.error ? 'mc-error-color' : 'mc-flag-not-set',
                importantClass: task.flags.important ? 'mc-important-color' : 'mc-flag-not-set',
                reviewClass: task.flags.review ? 'mc-review-color' : 'mc-flag-not-set'
            },
            selectedClass: '',
            editTitle: true,
            open: false,
            maximize: false
        };
        task.node = null;
    }
}