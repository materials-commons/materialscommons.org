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
        for (let i = 0; i < this.datasets.length; i++) {
            // Fake dataset counts until REST/server available
            let stats = {
                comment_count: this.datasets[i].comment_count,
                unique_view_count: {
                    authenticated: 4 + i,
                    anonymous: 5 - i
                },
                download_count: 20 + i,
                favorite_count: 30 - 1
            };
            this.datasets[i].stats = stats;
        }
    }

    $onInit() {
        this.mcbus.subscribe('MCDATA$SEARCH', this.myName, (query) => this.query = query);
    }

    $onDestroy() {
        this.mcbus.leave('MCDATA$SEARCH', this.myName);
    }

    orderByThisValue(dataset) {
        let ret = 99999999;

        switch (this.sortBy){
            case "Total Number of Views":
                ret = dataset.stats.unique_view_count.authenticated
                    + dataset.stats.unique_view_count.anonymous;
                break;
            case "Number of Anonymous Views":
                ret = dataset.stats.unique_view_count.anonymous;
                break;
            case "Number of Authenticated Views":
                ret = dataset.stats.unique_view_count.authenticated;
                break;
            case "Number of Downloads":
                ret = dataset.stats.download_count;
                break;
            case "Number of Comments":
                ret = dataset.stats.comment_count;
                break;
            case "Number of Favorites":
                ret = dataset.stats.favorite_count;
                break;
        }

        return ret;
    }

    onSortedSelection() {
        console.log("Selection is " + this.sortBy)
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

