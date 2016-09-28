angular.module('materialscommons').component('mcProjectExperimentsCards', {
    templateUrl: 'app/project/experiments/mc-project-experiments-cards.html',
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
