class MCTaskTemplateCreateSamplesComponentController {
    /*@ngInject*/
    constructor(prepareCreatedSample, focus, $mdDialog) {
        this.lastId = 0;
        this.prepareCreatedSample = prepareCreatedSample;
        this.focus = focus;
        this.$mdDialog = $mdDialog;

        if (!this.task.template.samples) {
            this.task.template.samples = [];
        }
    }

    addSample() {
        let lastItem = this.task.template.samples.length - 1;
        // If there is no name for the last entry then do not add a new entry.
        if (lastItem !== -1 && this.task.template.samples[lastItem].name === '') {
            return;
        }
        let id = 'sample_' + this.lastId++;
        this.task.template.samples.push({
            name: '',
            id: id
        });
        this.focus(id);
    }

    remove(index) {
        this.task.template.samples.splice(index, 1);
    }

    addMultipleSamples() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/tasks/components/add-multiple-samples-dialog.html',
            controller: AddMultipleSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                lastId: this.lastId
            }
        }).then(
            (samples) => {
                this.task.template.samples = this.task.template.samples.concat(samples.added);
                this.lastId = samples.nextId;
            }
        )
    }

    prepareSample() {
        this.prepareCreatedSample.filloutComposition(this.sample, this.composition);
        this.prepareCreatedSample.setupSampleGroup(this.sample, this.sampleGroup, this.sampleGroupSizing,
            this.sampleGroupSize);
        this.prepareCreatedSample.addSampleInputFiles(this.sample, this.process.input_files);
    }
}

angular.module('materialscommons').component('mcTaskTemplateCreateSamples', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/components/mc-task-template-create-samples.html',
    controller: MCTaskTemplateCreateSamplesComponentController,
    bindings: {
        task: '='
    }
});

class AddMultipleSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog, toast) {
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.nameTemplate = "";
        this.count = 2;
    }

    done() {
        if (this.nameTemplate.indexOf('$INDEX') == -1) {
            this.toast.error(`Template name doesn't contain $INDEX`);
            return;
        }

        console.log(this.lastId);
        let addedSamples = [];
        for (let i = 0; i < this.count; i++) {
            let id = "sample_" + i,
                name = this.nameTemplate.replace("$INDEX", "" + (this.lastId + i + 1)),
                entry = {
                    name: name,
                    id: id
                };
            addedSamples.push(entry);
        }
        let nextId = this.lastId + addedSamples.length;
        this.$mdDialog.hide({added: addedSamples, nextId: nextId});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
