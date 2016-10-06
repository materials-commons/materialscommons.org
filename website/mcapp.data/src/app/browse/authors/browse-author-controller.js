export class BrowseAuthorsController {
  constructor(authors) {
    'ngInject';
    console.dir(authors); // eslint-disable-line no-console
    this.authors = authors;
    this.pageSize = 10;

  }

}

