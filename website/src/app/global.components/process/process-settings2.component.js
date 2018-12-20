angular.module('materialscommons').component('processSettings2', {
    bindings: {
        settings: '<',
        templateId: '<',
        attribute: '<',
        processId: '<',
        name: '<',
    },
    template: require('./process-settings2.html')
});
