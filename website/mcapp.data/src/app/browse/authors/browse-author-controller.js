export class BrowseAuthorsController {
  constructor(authors) {
    'ngInject';
    // console.dir(authors); // i suspect that this is an error  // eslint-disable-line no-console
    this.authors = authors;
    this.pageSize = 10;

  }

}

