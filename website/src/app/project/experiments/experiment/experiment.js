export class ExperimentStep {
    constructor(title, _type) {
        this.id = '';
        this.title = title;
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
                showTitle: true,
                showStatus: true,
                showNotes: true,
                showFiles: false,
                showSamples: false,
                currentFilesTab: 0,
                currentSamplesTab: 0
            }
        };
        this.node = null;
    }

    addStep(step) {
        this.steps.push(step);
    }
}

export class Experiment {
    constructor(name) {
        this.name = name;
        this.goal = '';
        this.description = '';
        this.aim = '';
        this.steps = [];
    }

    addStep(title, _type) {
        let s = new ExperimentStep(title, _type);
        this.steps.push(s);
    }
}

