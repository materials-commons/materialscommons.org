(function (module) {
    module.factory("processList", ["Restangular", processList]);

    function processList(Restangular) {
        var self = this;
        self.process = {};

        return {
            getProcess: function (process_id, processes) {
                var i = _.indexOf(processes, function (process) {
                    return process.id === process_id;
                });
                if (i > -1) {
                    self.process = processes[i];
                } else {
                    self.process = processes[0];
                }
                Restangular.all("samples").post({process_id: self.process.id}).then(function (response) {
                    self.process.samples = response.samples;
                });
                return self.process;
            }
        };
    }
}(angular.module('materialscommons')));
