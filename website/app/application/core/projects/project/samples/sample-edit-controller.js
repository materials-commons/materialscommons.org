Application.Controllers.controller('projectEditSample',
    ["$scope", "$modal", "$stateParams", "project", "mcapi", projectEditSample]);

function projectEditSample($scope, $modal, $stateParams, project, mcapi) {
    $scope.processes = ["SEM Imaging", "Heat Treatment", "As Received"];
    $scope.attachments = ["A1.jpg", "B1.png"];

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
        mcapi('/sample/measurements/%/propertyset/%', $scope.current.id, $scope.current.property_set_id)
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
        var i = _.indexOf($scope.project.samples, function (sample) {
            return sample.id === $stateParams.sample_id;
        });
        if (i > -1) {
            $scope.current = $scope.project.samples[i];
        }
        getMeasurements();

    }

    init();

}

