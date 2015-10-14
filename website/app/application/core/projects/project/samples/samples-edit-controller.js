(function (module) {
    module.controller('SamplesEditController', SamplesEditController);
    SamplesEditController.$inject = ["$scope", "sample", "project",
       "pubsub", "mcfile", "Restangular"];

    function SamplesEditController($scope, sample, project, pubsub, mcfile, Restangular) {
        var ctrl = this;

        ctrl.isSet = isSet;
        ctrl.setTab = setTab;
        ctrl.fileSrc = fileSrc;
        //ctrl.getMeasurements = getMeasurements;
        //ctrl.setOthersToFalse = setOthersToFalse;

        ctrl.tab = "measurements";
        ctrl.sample = sample[0];
        ctrl.project = project;

        function setTab(tabId) {
            ctrl.tab = tabId;
        }

        function isSet(tabId) {
            return ctrl.tab === tabId;
        }

        function fileSrc(id) {
            return mcfile.src(id);
        }

        //$scope.fileSrc = mcfile.src;
        //$scope.isImage = isImage;

        pubsub.waitOn($scope, 'updateBestMeasurement', function () {
            Restangular.one('sample').one('details', ctrl.sample.id).get().then(function(updated_sample){
                ctrl.sample = updated_sample[0];
            });
        });

        //function processColumns() {
        //    $scope.properties.forEach(function (property) {
        //        if (property.best_measure.length > 0 && (property.best_measure[0]._type === 'line' ||
        //            property.best_measure[0]._type === 'histogram')) {
        //            property.best_measure[0].categories = property.best_measure[0].value.categories.split("\n");
        //            property.best_measure[0].values = property.best_measure[0].value.values.split("\n");
        //        }
        //    });
        //}

    }
}(angular.module('materialscommons')));

