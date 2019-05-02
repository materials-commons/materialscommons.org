class MCProcessActionsComponentController {
    /*@ngInject*/
    constructor(selectItems) {
        this.selectItems = selectItems;

        this.state = {
            createSampleName: '',
        };

        this.items = [
            {
                action: 'create',
                kind: 'sample',
                files: [],
                samples: [],
            }
        ];

        this.action = 'create';
        this.what = 'sample';
    }

    $onChanges(changes) {

    }

    addNewAction() {
        this.items.push({
            action: 'create',
            kind: 'sample',
            item: '',
            files: [],
            samples: [],
        });
    }

    delete(index) {
        if (index === 0) {
            this.items[0].action = 'create';
            this.items[0].kind = 'sample';
            this.items[0].files.length = 0;
            this.items[0].samples = [];
        } else {
            this.items.splice(index, 1);
        }
    }

    addCreateSample(item) {
        console.log('addCreateSample item =', item);
        if (this.state.createSampleName !== '') {
            item.samples.push({name: angular.copy(this.state.createSampleName)});
            this.state.createSampleName = '';
        }
    }

    selectFiles(item) {
        this.selectItems.fileTree(true).then(selected => {
            console.log('selected files =', selected.files);
            item.files = selected.files;
        });
    }

    selectSamples(item) {
        this.selectItems.samplesFromProject(this.projectId, this.experimentId).then(selected => {
            console.log('selectSamples selected samples', selected.samples);
            item.samples = selected.samples;
        });
    }

}

angular.module('materialscommons').component('mcProcessActions', {
    controller: MCProcessActionsComponentController,
    template: require('./process-actions.html'),
    bindings: {}
});