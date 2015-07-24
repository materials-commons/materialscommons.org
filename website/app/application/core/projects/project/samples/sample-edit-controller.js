Application.Controllers.controller('projectEditSample',
    ["$scope", "$modal", "$stateParams", "project", "mcapi", "modalInstance", "pubsub", projectEditSample]);

function projectEditSample($scope, $modal, $stateParams, project, mcapi, modalInstance, pubsub) {

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

    function getMeasurements(sample_id){
        mcapi('/sample/propertysets/%', sample_id)
            .success(function (property_sets) {
                angular.forEach(property_sets, function(values, key){
                    values.forEach(function(item){
                        if(item.name === "As Received"){
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

    function setOthersToFalse(values){
        values.forEach(function(item){
            if(item.name === "As Received"){
            } else{
                item.does_transform = false;
            }
        });
    }

    $scope.openFile = function(file){
        modalInstance.openModal(file, 'datafile', project);
    };

    $scope.showProperties = function(ps_id){
        $scope.ps_id = ps_id;
        mcapi('/sample/measurements/%/%', $scope.current.id, ps_id)
            .success(function (properties) {
                $scope.properties = properties;
            })
            .error(function (err) {
                console.log(err)
            })
            .jsonp();
    }

    function init() {
        $scope.project = project;
        if($scope.project.samples.length !==0){
            var i = _.indexOf($scope.project.samples, function (sample) {
                return sample.id === $stateParams.sample_id;
            });
            if (i > -1) {
                $scope.current = $scope.project.samples[i];
            }else{
                $scope.current =  $scope.project.samples[0];
            }

            getMeasurements($scope.current.id);
        }



    }

    init();

}

