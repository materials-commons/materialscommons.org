class MCProjectComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcProject', {
    template: require('./mc-project.html'),
    controller: MCProjectComponentController
});
