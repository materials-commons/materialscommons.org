angular.module('materialscommons').factory('toUIStep', toUIStepService);

/*@ngInject*/
function toUIStepService() {
    return function(step) {
        step.displayState = {
            details: {
                showNotes: true,
                showFiles: false,
                showSamples: false,
                currentFilesTab: 0,
                currentSamplesTab: 0
            },
            flags: {
                errorClass: step.flags.error ? 'mc-error-color:' : 'mc-flag-not-set',
                importantClass: step.flags.important ? 'mc-important-color' : 'mc-flag-not-set',
                reviewClass: step.flags.review ? 'mc-review-color' : 'mc-flag-not-set'
            },
            selectedClass: '',
            editTitle: true,
            open: false,
            maximize: false
        };
        step.node = null;
    }
}