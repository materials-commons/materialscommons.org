angular.module('materialscommons').component('mcProjectExperimentsCards', {
    template: require('./mc-project-experiments-cards.html'),
    controller: MCProjectExperimentsCardsComponentController,
    bindings: {
        experiments: '=',
        filterBy: '<'
    }
});

class MCProjectExperimentsCardsComponentController {
    constructor() {

    }
}
