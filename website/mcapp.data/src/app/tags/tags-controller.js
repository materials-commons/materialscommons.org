export class TagController {
    constructor(results, $stateParams, $previousState) {
        'ngInject';
        this.results = results;
        this.$previousState = $previousState;
        this.tag = $stateParams.id;
        this.pageSize = 10;
    }

    previousState() {
        this.$previousState.go();
    }
}

