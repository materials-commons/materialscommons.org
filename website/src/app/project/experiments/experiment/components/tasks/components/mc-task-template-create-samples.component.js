class MCTaskTemplateCreateSamplesComponentController {
    /*@ngInject*/
    constructor(prepareCreatedSample, focus, $mdDialog) {
        this.lastId = 0;
        this.prepareCreatedSample = prepareCreatedSample;
        this.focus = focus;
        this.$mdDialog = $mdDialog;

        if (!this.task.template.samples) {
            let id = 'sample_' + this.lastId++;
            this.task.template.samples = [];
        }
    }

    addSample() {
        let id = 'sample_' + this.lastId++;

        this.task.template.samples.push({
            name: '',
            id: id
        });
        this.focus(id);
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
            (addedSamples, nextId) => {
                this.task.template.samples = this.task.template.samples.concat(addedSamples);
                this.lastId = nextId;
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
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.nameTemplate = "";
        this.count = 2;
    }

    done() {
        let addedSamples = [];
        for (let i = 0; i < this.count; i++) {
            let id = "sample_" + i,
                entry = {
                    name: 'sample_' + (i + 1),
                    id: id
                };
            addedSamples.push(entry);
        }
        console.log(addedSamples.length);
        this.$mdDialog.hide(addedSamples);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
