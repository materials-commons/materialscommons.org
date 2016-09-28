export class ExperimentTask {
    constructor(name, _type) {
        this.id = '';
        this.name = name;
        this._type = _type;
        this.tasks = [];
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

    addTask(task) {
        this.tasks.push(task);
    }
}

export class Experiment {
    constructor(name) {
        this.name = name;
        this.goal = '';
        this.description = '';
        this.aim = '';
        this.status = 'active';
        this.tasks = [];
    }

    addTask(name, _type) {
        let task = new ExperimentTask(name, _type);
        this.tasks.push(task);
    }
}

