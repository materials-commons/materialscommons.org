export class BrowseAuthorsController {
  constructor(authors) {
    'ngInject';
    this.authors = authors;
    this.pageSize = 10;
  }
}

