class MCAPIDocsService {
    constructor(User, $document) {
        this.User = User;
        this.$document = $document;
        this.apidocs = buildAPIDocs();
    }

    getApiArgs(api) {
        if (!(api in this.apidocs)) {
            return null;
        }

        return this.apidocs[api].createArgs;
    }

    curlCommand(api, args) {
        if (!(api in this.apidocs)) {
            return null;
        }
        let apidoc = this.apidocs[api];
        let apikey = User.apikey();
        let origin = this.$document[0].location.origin;
        let apiUrl = `'${origin}/api/${apidoc.path}?apikey=${apikey}'`;
        let additional = '';
        if (args) {
            let args = JSON.stringify(curl.args);
            additional = `-H 'Content-Type: "application/json"' -d '${args}'`;
        }
        return `curl -XPOST ${additional} ${apiUrl}`;
    }

    // simplePython(api) {
    //     return '';
    // }
    //
    // fullPython(api) {
    //     return '';
    // }
}

angular.module('materialscommons').service('mcapidocs', MCAPIDocsService);

function buildAPIDocs() {
    return {
        getSample: {
            path: 'v3/getSample',
            args: {sample_id: ''},
            createArgs: (sampleId) => ({sample_id: sampleId}),
        }
    };
}