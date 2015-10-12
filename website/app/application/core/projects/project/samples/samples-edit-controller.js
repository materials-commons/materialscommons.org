(function (module) {
    module.controller('SamplesEditController', SamplesEditController);
    SamplesEditController.$inject = ["$scope", "$modal", "sample", "project", "mcapi",
        "modalInstance", "pubsub", "mcfile"];

    function SamplesEditController($scope, $modal, sample, project, mcapi, modalInstance, pubsub, mcfile) {
        var ctrl = this;

        ctrl.isSet = isSet;
        ctrl.setTab = setTab;
        ctrl.fileSrc = fileSrc;
        //ctrl.measurements = measurements;
        //ctrl.getMeasurements = getMeasurements;
        //ctrl.setOthersToFalse = setOthersToFalse;

        ctrl.tab = "files";
        ctrl.sample = sample[0];
        console.dir(ctrl.sample);

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
            getMeasurements($scope.current.id);
        });

        //function measurements(property) {
        //    $scope.modal = {
        //        instance: null,
        //        property: property
        //    };
        //
        //    $scope.modal.instance = $modal.open({
        //        size: 'lg',
        //        templateUrl: 'application/core/projects/project/samples/view-measurements.html',
        //        controller: 'viewMeasurementController',
        //        resolve: {
        //            modal: function () {
        //                return $scope.modal;
        //            },
        //            project: function () {
        //                return $scope.project;
        //            }
        //        }
        //    });
        //}

        //function getMeasurements(sample_id) {
        //    mcapi('/sample/propertysets/%', sample_id)
        //        .success(function (property_sets) {
        //            angular.forEach(property_sets, function (values) {
        //                values.forEach(function (item) {
        //                    if (item.process_type === "as_received") {
        //                        item.direction = 'out';
        //                        item.does_transform = true;
        //                        setOthersToFalse(values);
        //                    }
        //                });
        //            });
        //            $scope.property_sets = property_sets;
        //            $scope.showProperties(Object.keys(property_sets)[0]);
        //        })
        //        .error(function (err) {
        //            console.log(err)
        //        })
        //        .jsonp();
        //
        //    mcapi('/sample/datafile/%', $scope.current.id)
        //        .success(function (files) {
        //            $scope.current.files = files;
        //        }).jsonp();
        //}

        //function setOthersToFalse(values) {
        //    values.forEach(function (item) {
        //        if (item.process_type === "as_received") {
        //        } else {
        //            item.does_transform = false;
        //        }
        //    });
        //}
        //
        //$scope.showProperties = function (ps_id) {
        //    $scope.ps_id = ps_id;
        //    mcapi('/sample/measurements/%/%', $scope.current.id, ps_id)
        //        .success(function (properties) {
        //            $scope.properties = properties;
        //            processColumns();
        //        })
        //        .error(function (err) {
        //            console.log(err)
        //        })
        //        .jsonp();
        //};
        //
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

