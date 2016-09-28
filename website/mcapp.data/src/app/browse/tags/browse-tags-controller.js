export class BrowseTagsController {
    constructor(tags, actionsService, $state) {
        'ngInject';
        this.tags = tags;
        this.actionsService = actionsService;
        this.$state = $state;
        this.tagPlaceholder = " ";
        this.tagDatasets = {};
    }

    viewTagResults(tag) {
        this.$state.go("tags", {id: tag.id});
    }

    datasetForTag(tag) {
        if (this.tagDatasets[tag]) {
            return this.tagDatasets[tag];
        }
        this.tagDatasets[tag] = {wait: "Fetching Data"};
        let ds = this.actionsService.getDatasetsByTag(tag);
        ds.then(x => {
            this.tagDatasets[tag] = {data: x};
        });
        return this.tagDatasets[tag];
    }
}

