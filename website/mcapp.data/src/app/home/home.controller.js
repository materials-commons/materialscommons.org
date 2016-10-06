export class HomeController {
  constructor(tags, count_authors, count_datasets, browseService, $state, userService) {
    'ngInject';

    this.browseService = browseService;
    this.userService = userService;
    this.$state = $state;
    this.tags = tags;
    this.count_tags = tags.length;
    this.count_authors = count_authors;
    this.count_datasets = count_datasets;
    this.tagPlaceholder = " ";
    if (this.count_tags === 0) {
      this.tagPlaceholder = 'No Tags';
    } else {
      this.tagPlaceholder = ' ';
    }
  }

  orderByDatasetCount(samples) {
    return _.sortBy(samples, 'dataset_count').reverse(); // eslint-disable-line no-undef
  }

  viewTagResults(tag) {
    this.$state.go("tags", {id: tag.id});
  }

  isUserLoggedIn() {
    return this.userService.isAuthenticated();
  }
}

