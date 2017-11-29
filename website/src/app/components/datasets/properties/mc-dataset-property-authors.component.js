class MCDatasetPropertyAuthorsComponentController {
    /*@ngInject*/
    constructor() {
    }

    formatAuthorList(authors) {
        if ((!authors) || (authors.length === 0)) return "(no authors are listed)";
        return "By " + authors.map(this.formatAuthor).join('; ');
    }

    formatAuthor(a) {
        return a.lastname + ", " + a.firstname + " (" + a.affiliation + ")";
    }
}

angular.module('materialscommons').component('mcDatasetPropertyAuthors', {
    template: `
        <table>
            <tbody>
                <tr>
                    <td><label>Authors</label></td>
                    <td>{{$ctrl.formatAuthorList($ctrl.dataset.authors)}}</td>
                </tr>
            </tbody>
        </table>
    `,
    controller: MCDatasetPropertyAuthorsComponentController,
    bindings: {
        dataset: '<'
    }
});