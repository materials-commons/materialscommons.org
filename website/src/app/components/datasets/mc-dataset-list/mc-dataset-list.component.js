class MCDatasetListComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.myName = 'MCDatasetListComponentController';
        this.sortByChoices = [
            "Total Number of Views", "Number of Anonymous Views",
            "Number of Authenticated Views", "Number of Downloads",
            "Number of Comments", "Number of Favorites"
        ];
        this.sortBy = this.sortByChoices[0];
    }

    $onInit() {
        this.mcbus.subscribe('MCDATA$SEARCH', this.myName, (query) => this.query = query);
    }

    $onDestroy() {
        this.mcbus.leave('MCDATA$SEARCH', this.myName);
    }

    orderByField() {
        // default
        let ret = "stats.unique_view_count.total";

        switch (this.sortBy){
            case "Number of Anonymous Views":
                ret = "stats.unique_view_count.anonymous";
                break;
            case "Number of Authenticated Views":
                ret = "stats.unique_view_count.authenticated";
                break;
            case "Number of Downloads":
                ret = "stats.download_count";
                break;
            case "Number of Comments":
                ret = "stats.comment_count";
                break;
            case "Number of Favorites":
                ret = "stats.favorite_count";
                break;
        }

        return ret;
    }

}

angular.module('materialscommons').component('mcDatasetList', {
    templateUrl: 'app/components/datasets/mc-dataset-list/mc-dataset-list.html',
    controller: MCDatasetListComponentController,
    bindings: {
        datasets: '<',
        detailsRoute: '@'
    }
});

