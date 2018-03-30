angular.module('materialscommons').component('processSettings2', {
    bindings: {
        settings: '<',
        templateId: '<',
        attribute: '<',
        processId: '<'
    },
    template: require('./process-settings2.html')
});
