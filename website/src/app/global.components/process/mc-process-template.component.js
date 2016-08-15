angular.module('materialscommons').component('mcProcessTemplate', {
    templateUrl: 'app/global.components/process/mc-process-template.html',
    bindings: {
        process: '<',
        onChange: '&'
    }
});
