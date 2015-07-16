Application.Controllers.controller('projectCreateProcess',
    ["$scope", "project", "processTemplates", "$modal", "pubsub", "mcapi", "$state", projectCreateProcess]);


function projectCreateProcess($scope, project, processTemplates, $modal, pubsub, mcapi, $state) {

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

    pubsub.waitOn($scope, 'updateTransformedSample', function (transformed_sample) {
        updateTransformedSample(transformed_sample);
    });

    function updateTransformedSample(transformed_sample) {
        var i = _.indexOf($scope.template.transformed_samples, function (entry) {
            return sample.sample_id === entry.sample_id;
        });
        if (i > -1) {
            $scope.template.transformed_samples[i] = transformed_sample;
        } else {
            $scope.template.transformed_samples.push(transformed_sample);
        }
    }

    $scope.linkSample = function (datafile) {
        var i = _.indexOf($scope.template.input_samples, function (entry) {
            return $scope.bk.selectedSample.id === entry.id;
        });
        $scope.template.input_samples[i].files.push({id: datafile.id, name: datafile.name});
        $scope.bk.selectedSample = '';
    };

    function updateSampleMeasurement(sample) {
        var i = _.indexOf($scope.template.input_samples, function (entry) {
            return sample.id === entry.id;
        });
        $scope.template.input_samples[i] = sample;
    }

    function addSetup(setup) {
        $scope.template.setup = setup;
    }


    function addAttachment(item) {
        var what;
        switch (item.type) {
            case "sample":
                what = 'input_samples';
                item.new_properties = [];
                item.transformed_properties = [];
                item.files = [];
                item.property_set_id = item.property_set_id;
                console.log(item.property_set_id);
                //when they choose sample pull all property-measurements from backend
                mcapi('/sample/measurements/%/%', item.id, item.property_set_id)
                    .success(function (properties) {
                        item.properties = properties;
                    })
                    .error(function (err) {
                        console.log(err)
                    })
                    .jsonp();
                break;
            case "datafile":
                if ($scope.type === 'input_files') {
                    what = 'input_files';
                } else {
                    what = 'output_files';
                }
                break;
        }
        var i = _.indexOf($scope.template[what], function (entry) {
            return item.id === entry.id;
        });
        if (i === -1) {
            $scope.template[what].push(item);
        } else {
            $scope.template[what].splice(i, 1);
        }
    }

    $scope.removeAttachment = function (item, what, sample_id) {
        switch (what) {
            case "input_samples":
                spliceItem(item, what);
                break;
            case "input_files":
                spliceItem(item, what);
                break;
            case "output_files":
                spliceItem(item, what) ;
                break;
            case "new_properties":
                var index = _.indexOf($scope.template.input_samples, function (entry) {
                    return sample_id === entry.id;
                });
                var i = _.indexOf($scope.template.input_samples[index][what], function (entry) {
                    return item.name === entry.name;
                });
                if (i > -1) {
                    $scope.template.input_samples[index][what].splice(i, 1);
                }
                break;
            case "properties":
                var index = _.indexOf($scope.template.input_samples, function (entry) {
                    return sample_id === entry.id;
                });
                var i = _.indexOf($scope.template.input_samples[index][what], function (entry) {
                    return item.id === entry.id;
                });
                if (i > -1) {
                    delete $scope.template.input_samples[index][what][i]['measures'];
                    console.log($scope.template.input_samples[index][what][i]);
                }
                break;
        }
    };

    function spliceItem(item, what){
        var i = _.indexOf($scope.template[what], function (entry) {
            return item.id === entry.id;
        });
        if (i > -1) {
            $scope.template[what].splice(i, 1);
        }
    }

    $scope.removeLink = function (link, what, attachment) {
        var i = _.indexOf($scope.template[what], function (entry) {
            return attachment.id === entry.id;
        });
        if (i > -1) {
            var j = _.indexOf($scope.template[what][i].links, function (entry) {
                return link.id === entry.id;
            });

            if (j > -1) {
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

    $scope.transformation = function (sample) {
        $scope.modal = {
            instance: null,
            sample: sample
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/transformation.html',
            controller: 'TransformationController',
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
            items: [],
            type: type
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

    $scope.createProcess = function () {
        if ($scope.template._type === 'as_received') {
            $scope.template.output_samples.push($scope.bk.newSample);
        } else {
            $scope.template = refineSampleProperties();
        }
        $scope.template.input_files = refineFiles($scope.template.input_files);
        $scope.template.output_files = refineFiles($scope.template.output_files);
        console.dir($scope.template);
        mcapi('/projects2/%/processes', project.id)
            .success(function (proc) {
                //After you create a process try to update the whole project.
                // Because samples, processes should be refreshed in
                // order for user to create another process
                $scope.template = '';
                $scope.bk = {
                    selectedSample: {}
                };
                console.log("success");
                $state.go('projects.project.processes.list');
            })
            .error(function (err) {
                $scope.template = '';
                console.log("err");
                console.log(err);
            })
            .post($scope.template);
    };

    function refineSampleProperties() {
        $scope.template.input_samples.forEach(function (sample) {
            sample.properties = refine(sample.properties);
            sample.new_properties = refine(sample.new_properties);
        });
        return $scope.template;
    }


    function refine(items) {
        var each_measure = {};
        items.forEach(function (item) {
            item.measurements = [];
            if ('measures' in item) {
                item.measures.forEach(function (m) {
                    if (m.name === 'Composition') {
                        each_measure = {
                            value: m.value,
                            _type: m._type,
                            unit: m.unit,
                            attribute: m.attribute,
                            element: m.element
                        };

                    } else {
                        each_measure = {value: m.value, _type: m._type, unit: m.unit, attribute: m.attribute};
                    }
                    item.measurements.push(each_measure);
                });
            }
        });
        return items;
    }

    function refineFiles(files) {
        var items = [];
        files.forEach(function (file) {
            items.push({id: file.id, name: file.name, path: file.path});
        });
        return items;
    }

    function init() {
        $scope.template = processTemplates.getActiveTemplate();
        $scope.bk = {
            selectedSample: {},
            newSample: {}
        };
        $scope.isEmptyTemplate = _.isEmpty($scope.template);
        if ($scope.isEmptyTemplate === true) {
            $state.go('projects.project.processes.list')
        }
    }

    init();
}
