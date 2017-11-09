class MCDatasetPropertyStatsComponentController {
    /*@ngInject*/
    constructor() {
    }

    totalViews(stats) {
        return stats.unique_view_count.anonymous + stats.unique_view_count.authenticated;
    }

}

angular.module('materialscommons').component('mcDatasetPropertyStats', {
    template: `
        <p class="small action-count">
            <span style="padding-left: 10px;">{{$ctrl.totalViews($ctrl.dataset.stats)}} Total views</span>
            <span style="padding-left: 10px;">{{$ctrl.dataset.stats.unique_view_count.anonymous}} Anonymous views</span>
            <span style="padding-left: 10px;">{{$ctrl.dataset.stats.unique_view_count.authenticated}} Authenticated views</span>
            <span style="padding-left: 10px;">{{$ctrl.dataset.stats.comment_count}} Comments</span>
            <span style="padding-left: 10px;">{{$ctrl.dataset.stats.download_count}} Downloads</span>
            <span style="padding-left: 10px;">{{$ctrl.dataset.stats.favorite_count}} Favorites</span>
        </p>
    `,
    controller: MCDatasetPropertyStatsComponentController,
    bindings: {
        dataset: '<'
    }
});
