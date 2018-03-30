angular.module('materialscommons').component('mcProcessCreate', {
    template: require('./mc-process-create.html'),
    controller: MCProcessCreateComponentController,
    bindings: {
        template: '='
    }
});

function MCProcessCreateComponentController() {
    'ngInject';
    var ctrl = this;  // eslint-disable-line no-unused-vars
    //console.dir(ctrl.template);
    //ctrl.template = template.get();
}
