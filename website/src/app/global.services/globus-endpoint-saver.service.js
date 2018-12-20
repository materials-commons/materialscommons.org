class GlobusEndpointSaverService {
    /*@ngInject*/
    constructor() {
        this.etlEndpoint = {
            path: 'Enter path here (ex. /~/mydir/)',
            uuid: 'Enter Globus UUID here',
            spreadsheet: 'input.xlsx',
            data: 'data'
        };

        this.nonEtlEndpoint = {
            path: 'Enter path here (ex. /~/mydir/)',
            uuid: 'Enter Globus UUID here',
        };
    }

    saveEtlEndpoint(path, uuid, spreadsheet, data) {
        this.etlEndpoint.path = path;
        this.etlEndpoint.uuid = uuid;
        this.etlEndpoint.spreadsheet = spreadsheet;
        this.etlEndpoint.data = data;
    }

    getEtlEndpoint() {
        return angular.copy(this.etlEndpoint);
    }

    saveNonEtlEndpoint(path, uuid) {
        this.nonEtlEndpoint.path = path;
        this.nonEtlEndpoint.uuid = uuid;
    }

    getNonEtlEndpoint() {
        return angular.copy(this.nonEtlEndpoint);
    }
}

angular.module('materialscommons').service('globusEndpointSaver', GlobusEndpointSaverService);