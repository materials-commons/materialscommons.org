export class BrowseAuthorsController {
  constructor(authors) {
    'ngInject';
    console.dir(authors);
    this.authors = authors;
    this.pageSize = 10;

  }

}

