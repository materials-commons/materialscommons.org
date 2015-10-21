(function (module) {
    module.controller('SamplesEditController', SamplesEditController);
    SamplesEditController.$inject = ["$scope", "sample", "project", "pubsub", "mcfile", "Restangular"];

    function SamplesEditController($scope, sample, project, pubsub, mcfile, Restangular) {
        var ctrl = this;

        ctrl.fileSrc = fileSrc;

        ctrl.tab = "measurements";
        ctrl.sample = sample[0];
        ctrl.project = project;

        function fileSrc(id) {
            return mcfile.src(id);
        }

        pubsub.waitOn($scope, 'updateBestMeasurement', function () {
            Restangular.one('sample').one('details', ctrl.sample.id).get().then(function (updated_sample) {
                ctrl.sample = updated_sample[0];
            });
        });
    }
}(angular.module('materialscommons')));

