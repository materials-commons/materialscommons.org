export function PropertyValueDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/directives/property-value.html',
        scope: {
            property: "@",
            value: "="
        },
        controller: PropertyValueController,
        controllerAs: 'ctrl',
        bindToController: true
    };
    return directive;
}

class PropertyValueController {
    constructor(userService, $window) {
        'ngInject';

        this.userService = userService;
        this.user = this.userService.isAuthenticated();
        this.$window = $window;
    }

    formatAuthor(a) {
        return a.lastname + ", " + a.firstname + " (" + a.affiliation + ")";
    }

    formatAuthorList(authors) {
        if (authors.length == 0) return "(no authors are listed)";
        return "By " + authors.map(this.formatAuthor).join('; ');
    }

    formatAuthors(authors) {
        return authors.map(a => `${a.lastname}, ${a.firstname} (${a.affiliation})`).join('; ');
    }

    getPublisherName(userId) {
        return userId;
    }

    urlForDownload(dataset) {
        var datasetId = dataset.id;
        var baseURL = `${this.$window.location.protocol}//${this.$window.location.hostname}:${this.$window.location.port}/api`;
        return `${baseURL}/pub/datasets/download/${datasetId}?apikey=${this.userService.apikey()}`;
    }

    bytesMessageForDownload(dataset){
        var numberOfBytes = (dataset.zipSize)?dataset.zipSize:-1;
        if (numberOfBytes < 0) return "zip file size unknown";
        if (numberOfBytes < 1024) return `${numberOfBytes} Bytes`;
        numberOfBytes = numberOfBytes/1024;
        if (numberOfBytes < 1024) return `${numberOfBytes.toFixed(2)} KB`;
        numberOfBytes = numberOfBytes/1024;
        if (numberOfBytes < 1024) return `${numberOfBytes.toFixed(2)} GB`;
        numberOfBytes = numberOfBytes/1024;
        return `${numberOfBytes.toFixed(2)} TB`;
    }

    filenameForDownload(dataset) {
        return (dataset.zipFilename)?(dataset.zipFilename):"FullDataset.zip";
    }
}
