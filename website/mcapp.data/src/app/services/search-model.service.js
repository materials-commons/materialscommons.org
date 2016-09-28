export class SearchModel {
    /*@ngInject*/
    constructor() {
        this.search = "";
    }

    setSearch(what) {
        this.search = what;
    }

    getSearch() {
        return this.search;
    }
}
