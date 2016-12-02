class ProcessSettings2ComponentController {
    /*@ngInject*/
    constructor(){
        console.log("ProcessSettings2ComponentController");
    }
}

angular.module('materialscommons').component('processSettings2', {
    binding: {
        settings: '=',
        templateId: '=',
        attribute: '=',
        processId: '='
    },
    controller: ProcessSettings2ComponentController,
    templateUrl: 'app/global.components/process/process-settings2.html'
});
