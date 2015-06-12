Application.Controllers.controller('projectCreateProcess',
    ["$scope", "project", "$state", "Template", "$modal", "pubsub", projectCreateProcess]);

function projectCreateProcess($scope, project, $state, Template, $modal, pubsub) {
    $state.go('projects.project.processes.create');

    $scope.template = Template.getActiveTemplate();
    $scope.model = {
        process_info: {what: '', why: ''},
        measurements: [],
        samples: {},
        attachments: {inputFiles: [], outputFiles: [], samples: []}
    };
    $scope.dynamicPopover = {
        content: 'Hello World',
        templateUrl: 'application/core/projects/project/processes/histogram.html',
        title: 'Title'
    };
    $scope.bk = {
        selectedSample: {}
    }

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment(sample);
    });

    pubsub.waitOn($scope, 'addProcessToReview', function (process) {
        addAttachment(process);
    });

    pubsub.waitOn($scope, 'addFileToReview', function (file) {
        addAttachment(file);
    });

    pubsub.waitOn($scope, 'addMeasurementToSample', function (sample) {
        addMeasurementToSample(sample);
    });

    $scope.linkSample = function(datafile, type){
        var i = _.indexOf($scope.model.attachments[type], function (entry) {
            return datafile.id === entry.id;
        });
        if ('links' in datafile){
            datafile.links.push($scope.bk.selectedSample);

        }   else{
            datafile.links = [];
            datafile.links.push($scope.bk.selectedSample);
        }
        $scope.model.attachments[type][i] = datafile;
        $scope.bk.selectedSample = '';

    };

    function addMeasurementToSample(sample) {
        var i = _.indexOf($scope.model.attachments.samples, function (entry) {
            return sample.id === entry.id;
        });
        $scope.model.attachments.samples[i] = sample;
    }

    function addAttachment(item) {
        var what;
        switch ($scope.type) {
            case "samples":
                what = 'samples';
                item.measurements = [];
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
            sample: sample,
            items: []
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

        $scope.modal = {
            instance: null,
            items: []
        };
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

    $scope.setUp = function(){
        $scope.modal = {
            instance: null,
            items: []
        };
        $scope.modal.instance = $modal.open({
            templateUrl: 'application/core/projects/project/processes/setup.html',
            controller: 'setupInstanceController',
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
