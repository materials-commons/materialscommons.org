Application.Controllers.controller('SamplesEditController',
    ["$scope", "$modal", "$stateParams", "project", "mcapi", "modalInstance", "pubsub", "mcfile", SamplesEditController]);

function SamplesEditController($scope, $modal, $stateParams, project, mcapi, modalInstance, pubsub, mcfile) {

    $scope.fileSrc = mcfile.src;
    $scope.isImage = isImage;

    pubsub.waitOn($scope, 'updateBestMeasurement', function () {
        getMeasurements($scope.current.id);
    });

    $scope.measurements = function (property) {
        $scope.modal = {
            instance: null,
            property: property
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/samples/view-measurements.html',
            controller: 'viewMeasurementController',
            resolve: {
                modal: function () {
                    return $scope.modal;
                },
                project: function () {
                    return $scope.project;
                }
            }
        });
    };

    function getMeasurements(sample_id) {
        mcapi('/sample/propertysets/%', sample_id)
            .success(function (property_sets) {
                angular.forEach(property_sets, function (values, key) {
                    values.forEach(function (item) {
                        if (item.process_type === "as_received") {
                            item.does_transform = true;
                            setOthersToFalse(values);
                        }
                    });
                });
                $scope.property_sets = property_sets;
                $scope.showProperties(Object.keys(property_sets)[0]);
            })
            .error(function (err) {
                console.log(err)
            })
            .jsonp();

        mcapi('/sample/datafile/%', $scope.current.id)
            .success(function (files) {
                $scope.current.files = files;
            }).jsonp();
    }

    function setOthersToFalse(values) {
        values.forEach(function (item) {
            if (item.process_type === "as_received") {
            } else {
                item.does_transform = false;
            }
        });
    }

    $scope.openFile = function (file) {
        modalInstance.openModal(file, 'datafile', project);
    };

    $scope.openProcess = function(processID) {
        var i = _.indexOf(project.processes, function(proc) {
            return proc.id == processID;
        });
        if (i !== -1) {
            modalInstance.openModal(project.processes[i], 'process', project);
        }
    };

    $scope.showProperties = function (ps_id) {
        $scope.ps_id = ps_id;
        mcapi('/sample/measurements/%/%', $scope.current.id, ps_id)
            .success(function (properties) {
                $scope.properties = properties;
                processColumns();

            })
            .error(function (err) {
                console.log(err)
            })
            .jsonp();
    };

    function processColumns() {
        $scope.properties.forEach(function (property) {
            if (property.best_measure.length > 0 && (property.best_measure[0]._type === 'line' ||
                property.best_measure[0]._type === 'histogram')) {
                property.best_measure[0].categories = property.best_measure[0].value.categories.split("\n");
                property.best_measure[0].values = property.best_measure[0].value.values.split("\n");
            }
        });
    }

    function init() {
        $scope.project = project;
        if ($scope.project.samples.length !== 0) {
            var i = _.indexOf($scope.project.samples, function (sample) {
                return sample.id === $stateParams.sample_id;
            });
            if (i != -1) {
                $scope.current = $scope.project.samples[i];
            } else {
                $scope.current = $scope.project.samples[0];
            }

            getMeasurements($scope.current.id);
        }
    }

    init();
}

