export class BrowseController {
  constructor(browseService, count_tags, count_authors, count_datasets) {
    'ngInject';
    this.browseService = browseService;
    this.count_tags = count_tags;
    this.count_authors = count_authors;
    this.count_datasets = count_datasets;
  }

  isRouteActive(route){
    return this.browseService.isRouteActive(route);
  }
}

