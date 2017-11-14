class MCDatasetPropertyStatsComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        if (!this.dataset.stats) {
            // Dataset fake stats counts until REST/server available
            let stats = {
                comment_count: this.dataset.comment_count,
                unique_view_count: {
                    authenticated: 4,
                    anonymous: 2
                },
                download_count: 8,
                useful_count: 5
            };
            this.dataset.stats = stats;
        }
    }

    totalViews(stats) {
        return stats.unique_view_count.anonymous + stats.unique_view_count.authenticated;
    }

}

angular.module('materialscommons').component('mcDatasetPropertyStats', {
    template: `
        <p>
            <span class="small action-count">
                <span style="padding-left: 10px;">{{$ctrl.totalViews($ctrl.dataset.stats)}} Views</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.comment_count}} Comments</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.download_count}} Downloads</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.useful_count}} Users marked this dataset as Useful</span>
            </span>
        </p>
    `,
    controller: MCDatasetPropertyStatsComponentController,
    bindings: {
        dataset: '<'
    }
});
