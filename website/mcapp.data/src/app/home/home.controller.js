export class HomeController {
    constructor(tags, authorsCount, datasetsCount, browseService, $state, userService) {
        'ngInject';

        this.browseService = browseService;
        this.userService = userService;
        this.$state = $state;
        this.tags = tags;
        this.tagsCount = tags.length;
        this.authorsCount = authorsCount;
        this.datasetsCount = datasetsCount;
        this.tagPlaceholder = " ";
        if (this.tagsCount === 0) {
            this.tagPlaceholder = 'No Tags';
        } else {
            this.tagPlaceholder = ' ';
        }
    }

    orderByDatasetCount(samples) {
        return _.sortBy(samples, 'dataset_count').reverse();
    }

    viewTagResults(tag) {
        this.$state.go("tags", {id: tag.id});
    }

    isUserLoggedIn() {
        return this.userService.isAuthenticated();
    }
}

