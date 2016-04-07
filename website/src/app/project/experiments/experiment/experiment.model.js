export class ExperimentStep {
    constructor(name, _type) {
        this.id = '';
        this.name = name;
        this._type = _type;
        this.steps = [];
        this.description = '';
        this.flags = {
            important: false,
            review: false,
            error: false,
            done: false
        };
        this.displayState = {
            details: {
                showNotes: true,
                showFiles: false,
                showSamples: false,
                currentFilesTab: 0,
                currentSamplesTab: 0
            },
            flags: {
                errorClass: 'mc-flag-not-set',
                importantClass: 'mc-flag-not-set',
                reviewClass: 'mc-flag-not-set'
            },
            selectedClass: '',
            open: false,
            maximize: false
        };
        this.node = null;
    }

    addStep(step) {
        this.steps.push(step);
    }
}

export function toUIStep(step) {
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

export class Experiment {
    constructor(name) {
        this.name = name;
        this.goal = '';
        this.description = '';
        this.aim = '';
        this.status = 'in-progress';
        this.steps = [];
    }

    addStep(name, _type) {
        let s = new ExperimentStep(name, _type);
        this.steps.push(s);
    }
}

