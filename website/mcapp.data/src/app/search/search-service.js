export class searchService {
    /*@ngInject*/
    constructor(Restangular, $filter) {
        this.Restangular = Restangular;
        this.$filter = $filter;
        this.searchChoices = [
            {name: 'All', value: 'all'}
            //{name: 'DOI', value: 'doi'},
            //{name: 'Author', value: 'authors'},
            //{name: 'Institution', value: 'affiliation'}
        ];
    }

    search(searchField, searchTerm) {
        return this.Restangular.one('pub').one('datasets').getList().then((ds) => {
            let datasets = ds.plain();
            let results = this.$filter('filter')(datasets, searchTerm);
            return results;
        });
    }

    // The following code doesn't work when search subfields in an array of objects. It is kept
    // around incase we need to refer to. This type of search is discussed here:
    // http://stackoverflow.com/questions/18504779/angularjs-filter-nested-object/23970242#23970242
    //
    // Probably need to write a custom comparator.
    //
    //static createSearch(searchField, searchTerm) {
    //    console.log('createSearch', searchField, searchTerm);
    //    let searchOn = {};
    //    if (searchField === 'all') {
    //        console.log('in all');
    //        searchOn = searchTerm;
    //    } else if (searchField === 'authors') {
    //        console.log('in authors');
    //        searchOn[searchField] = [searchTerm];
    //    } else if (searchField === 'affiliation') {
    //        console.log('in affiliation');
    //        let subsearch = {};
    //        subsearch['affiliation'] = searchTerm;
    //        searchOn['authors'] = [subsearch];
    //    } else {
    //        console.log('in else');
    //        searchOn[searchField] = searchTerm;
    //    }
    //    return searchOn;
    //}

    getSearchChoices() {
        return this.searchChoices;
    }

    // If no match then return all choice
    findSearchChoiceByValue(value) {
        let index = _.findIndex(this.searchChoices, c => c.value === value); // eslint-disable-line no-undef
        if (index === -1) {
            return this.searchChoices[0];
        }
        return this.searchChoices[index];
    }
}
