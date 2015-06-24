Application.Controllers.controller('projectCreateProcess',
    ["$scope", "project", "processTemplates", "$modal", "pubsub", projectCreateProcess]);

function projectCreateProcess($scope, project, processTemplates, $modal, pubsub) {
    $scope.template = processTemplates.getActiveTemplate();
    $scope.bk = {
        selectedSample: {}
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

    pubsub.waitOn($scope, 'updateSampleMeasurement', function (sample) {
        updateSampleMeasurement(sample);
    });

    pubsub.waitOn($scope, 'addSetup', function (setup) {
        addSetup(setup);
    });

    $scope.linkSample = function (datafile, type) {
        var i = _.indexOf($scope.template[type], function (entry) {
            return datafile.id === entry.id;
        });
        if ('links' in datafile) {
            datafile.links.push($scope.bk.selectedSample);
        } else {
            datafile.links = [];
            datafile.links.push($scope.bk.selectedSample);
        }
        $scope.template[type][i] = datafile;
        $scope.bk.selectedSample = '';
    };

    function updateSampleMeasurement(sample) {
        var i = _.indexOf($scope.template.samples, function (entry) {
            return sample.id === entry.id;
        });
        $scope.template.samples[i] = sample;
    }

    function addSetup(setup) {
        $scope.template.setup = setup;
    }

    function addAttachment(item) {
        var what;
        switch ($scope.type) {
            case "samples":
                what = 'samples';
                item.measurements = [];
                break;
            case "input_files":
                what = 'input_files';
                break;
            case "output_files":
                what = 'output_files';
                break;
        }
        var i = _.indexOf($scope.template[what], function (entry) {
            return item.id === entry.id;
        });
        if (i < 0) {
            $scope.template[what].push(item);
        } else {
            $scope.template[what].splice(i, 1);
        }
    }

    $scope.removeAttachment = function(item, what){
        var i = _.indexOf($scope.template[what], function (entry) {
            return item.id === entry.id;
        });
       if(i > -1) {
            $scope.template[what].splice(i, 1);
        }
    };

    $scope.removeLink = function(link, what, attachment){
        var i = _.indexOf($scope.template[what], function (entry) {
            return attachment.id === entry.id;
        });
        if(i > -1) {
            var j = _.indexOf($scope.template[what][i].links, function (entry) {
                return link.id === entry.id;
            });

            if(j > -1){
                $scope.template[what][i].links.splice(j, 1);
            }
        }
    };

    $scope.addMeasurement = function (sample) {
        $scope.modal = {
            instance: null,
            sample: sample
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

    $scope.setUp = function () {
        $scope.modal = {
            instance: null,
            items: []
        };
        $scope.modal.instance = $modal.open({
            templateUrl: 'application/processes/process-settings.html',
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

    $scope.createProcess = function(){
        console.dir($scope.template);
    };
}
