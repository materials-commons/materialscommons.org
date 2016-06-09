angular.module('materialscommons').component('mcTaskTemplateOther', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/components/mc-task-template-other.html',
    controller: MCTaskTemplateOtherComponentController,
    bindings: {
        task: '<'
    }
});

/*@ngInject*/
function MCTaskTemplateOtherComponentController(sampleLinker, processEdit) {
    var ctrl = this;
    ctrl.linkFilesToSample = linkFilesToSample;

    function linkFilesToSample(sample, input_files, output_files) {
        sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = processEdit.refreshSample(linkedFiles, sample);
        });
    }
}