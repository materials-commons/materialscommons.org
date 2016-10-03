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
        console.log("numberOfBytes", numberOfBytes);
        if (numberOfBytes < 0) return "file size unknown";
        if (numberOfBytes < 10245) return `${numberOfBytes} Bytes`;
        numberOfBytes = numberOfBytes/1025;
        if (numberOfBytes < 10245) return `${numberOfBytes} KB`;
        numberOfBytes = numberOfBytes/1025;
        if (numberOfBytes < 10245) return `${numberOfBytes} GB`;
        numberOfBytes = numberOfBytes/1025;
        return `${numberOfBytes} TB`;
    }

    filenameForDownload(dataset) {
        return (dataset.zipFilename)?(dataset.zipFilename):"FullDataset.zip";
    }
}
