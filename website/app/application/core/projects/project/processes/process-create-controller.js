Application.Controllers.controller('projectCreateProcess',
    ["$scope", "project", "$state", "Template", "$modal", "pubsub", projectCreateProcess]);

function projectCreateProcess($scope, project, $state, Template, $modal, pubsub) {
    $state.go('projects.project.processes.create');

    $scope.template = Template.getActiveTemplate();

    $scope.modal = {
        instance: null,
        items: ''
    };
    $scope.model = {
        process_info: {what: '', why: ''},
        measurements: [],
        samples: {},
        attachments: {inputFiles: [], outputFiles: [], samples: []}
    };

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment(sample);
    });

    pubsub.waitOn($scope, 'addProcessToReview', function (process) {
        addAttachment(process);
    });

    pubsub.waitOn($scope, 'addFileToReview', function (file) {
        addAttachment(file);
    });

    function addAttachment(item) {
        var what;
        switch ($scope.type) {
            case "samples":
                what = 'samples';
                break;
            case "inputFiles":
                what = 'inputFiles';
                break;
            case "outputFiles":
                what = 'outputFiles';
                break;
        }
        var i = _.indexOf($scope.model.attachments[what], function (entry) {
            return item.id === entry.id;
        });
        if (i < 0) {
            $scope.model.attachments[what].push(item);
        } else {
            $scope.model.attachments[what].splice(i, 1);
        }

    }

    $scope.addMeasurement = function (sample) {
        $scope.modal = {
            instance: null,
            items: [sample]
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/measurements.html',
            controller: 'MeasurementController',
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

    $scope.open = function (size, type) {
        $scope.type = type;
        $scope.modal.instance = $modal.open({
            templateUrl: 'application/core/projects/project/reviews/myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
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
}
