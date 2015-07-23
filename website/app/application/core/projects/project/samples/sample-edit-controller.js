Application.Controllers.controller('projectEditSample',
    ["$scope", "$modal", "$stateParams", "project", "mcapi", "modalInstance", "$filter", projectEditSample]);

function projectEditSample($scope, $modal, $stateParams, project, mcapi, modalInstance, $filter) {
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

    function getMeasurements(){
        mcapi('/sample/propertysets/%', $scope.current.id)
            .success(function (property_sets) {
                angular.forEach(property_sets, function(values, key){
                   var count = 0;
                    values.forEach(function(item){
                        if(item.does_transform === true){
                            count = count + 2;
                        }
                    });
                    if (count < 1){
                        values[0].does_transform = true;
                        values[0].name = "As Received"
                    }

                });
                $scope.property_sets = property_sets;
                console.dir($scope.property_sets);
                //$scope.showProperties(Object.keys(property_sets)[0]);
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

    $scope.openFile = function(file){
        modalInstance.openModal(file, 'datafile', project);
    };

    $scope.showProperties = function(ps_id){
        $scope.ps_id = ps_id;
        $scope.properties = [];
        mcapi('/sample/measurements/%/%', $scope.current.id, ps_id)
            .success(function (properties) {
                $scope.properties = properties;
                console.log(properties);
                console.log(ps_id)
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

            getMeasurements();
        }



    }

    init();

}

