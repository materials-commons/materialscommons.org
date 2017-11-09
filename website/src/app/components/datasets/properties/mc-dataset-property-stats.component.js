class MCDatasetPropertyStatsComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        if (!this.dataset.stats) {
            // Fake dataset counts until REST/server available
            let stats = {
                comment_count: this.dataset.comment_count,
                unique_view_count: {
                    authenticated: 4,
                    anonymous: 2
                },
                download_count: 8,
                favorite_count: 10
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
            <label>Statistics</label>
            <span class="small action-count">
                <span style="padding-left: 10px;">{{$ctrl.totalViews($ctrl.dataset.stats)}} Total views</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.unique_view_count.anonymous}} Anonymous views</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.unique_view_count.authenticated}} Authenticated views</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.comment_count}} Comments</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.download_count}} Downloads</span>
                <span style="padding-left: 10px;">{{$ctrl.dataset.stats.favorite_count}} Favorites</span>
            </span>
        </p>
    `,
    controller: MCDatasetPropertyStatsComponentController,
    bindings: {
        dataset: '<'
    }
});
