export class BrowseController {
    constructor(browseService, tagsCount, authorsCount, datasetsCount) {
        'ngInject';
        this.browseService = browseService;
        this.tagsCount = tagsCount;
        this.authorsCount = authorsCount;
        this.datasetsCount = datasetsCount;
    }

    isRouteActive(route) {
        return this.browseService.isRouteActive(route);
    }
}

