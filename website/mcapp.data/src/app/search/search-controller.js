export class SearchController {
    constructor($state, searchService, results, $uibModal) {
        'ngInject';

        this.searchService = searchService;
        this.selection = $state.params.selection;
        this.searchTerm = $state.params.searchTerm;
        this.results = results;
        this.pageSize = 10;
        this.$uibModal = $uibModal;
    }
}