class MCProcessFileUploadComponentController {
    /*@ngInject*/
    constructor(mcFlow) {
        this.flow = mcFlow.get();
        this.dir = {
            data: {
                id: 'da79ca63-eefb-48e6-a661-095fb64bee10',
                name: 'Test2'
            }
        }
    }

    hasUploads() {
        return this.flow.files.length;
    }
}

angular.module('materialscommons').component('mcProcessFileUpload', {
    controller: MCProcessFileUploadComponentController,
    template: `
    <mc-flow-button dir="$ctrl.dir"></mc-flow-button>
    <div ng-if="$ctrl.hasUploads()">
        <mc-file-uploads></mc-file-uploads>
    </div>
`
});
