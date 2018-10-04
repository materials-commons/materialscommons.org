export class ExperimentTask {
    constructor(name, otype) {
        this.id = '';
        this.name = name;
        this.otype = otype;
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

    addTask(name, otype) {
        let task = new ExperimentTask(name, otype);
        this.tasks.push(task);
    }
}

