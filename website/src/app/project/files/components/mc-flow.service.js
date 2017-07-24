angular.module('materialscommons').factory("mcFlow", mcFlowService);
function mcFlowService(User) {
    'ngInject';

    var self = this;
    self.flow = new Flow(
        {
            target: target,
            testChunks: false,
            forceChunkSize: true,
            fileParameterName: "chunkData"
        }
    );

    function target() {
        return "/api/upload/chunk?apikey=" + User.apikey();
    }

    self.service = {
        get: function() {
            return self.flow;
        }
    };

    return self.service;
}

