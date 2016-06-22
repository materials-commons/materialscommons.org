angular.module('materialscommons').component('mcTaskTemplateOther', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/components/mc-task-template-other.html',
    controller: MCTaskTemplateOtherComponentController,
    bindings: {
        task: '<'
    }
});

/*@ngInject*/
function MCTaskTemplateOtherComponentController(sampleLinker, processEdit, selectItems) {
    var ctrl = this;
    ctrl.linkFilesToSample = linkFilesToSample;

    function linkFilesToSample(sample, input_files, output_files) {
        sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = processEdit.refreshSample(linkedFiles, sample);
        });
    }

    ctrl.selectFiles = () => {
        selectItems.open('files').then(
            (selected) => {
                console.log('selectedFiles', selected);
            }
        );
    };

    ctrl.selectSamples = () => {
        selectItems.open('samples').then(
            (selected) => {
                console.log('selectedSamples', selected);
            }
        );
    };
}