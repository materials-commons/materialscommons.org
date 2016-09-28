export function MCPubSearchbarDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/directives/mcpub-searchbar.html',
        controller: MCPubSearchBarController,
        controllerAs: 'ctrl',
        bindToController: true
    };

    return directive;
}

class MCPubSearchBarController {
    /*@ngInject*/
    constructor($state, $stateParams, searchService) {
        this.searchChoices = searchService.getSearchChoices();
        this.$state = $state;
        if (typeof $stateParams.selection !== 'undefined') {
            this.selection = searchService.findSearchChoiceByValue($stateParams.selection);
            this.searchTerm = $stateParams.searchTerm;
        }
        else {
            this.selection = this.searchChoices[0];
            this.searchTerm = "";
        }
    }

    searchResults() {
        this.$state.go("search", {selection: this.selection.value, searchTerm: this.searchTerm});
    }

}
