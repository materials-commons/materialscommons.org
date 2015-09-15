(function (module) {
    module.controller('projectCreateProcess', projectCreateProcess);
    projectCreateProcess.$inject = ["$scope", "project", "processTemplates", "$modal", "pubsub",
        "mcapi", "$state", "Projects", "current", "measurements",
        "modalInstance", "$filter"];

    function projectCreateProcess($scope, project, processTemplates, $modal, pubsub,
                                  mcapi, $state, Projects, current, measurements, modalInstance, $filter) {

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

        pubsub.waitOn($scope, 'updateTransformedSample', function (transformed_sample) {
            updateTransformedSample(transformed_sample);
        });

        function updateTransformedSample(transformed_sample) {
            var i = _.indexOf($scope.template.transformed_samples, function (entry) {
                return transformed_sample.sample_id === entry.sample_id;
            });
            if (i > -1) {
                $scope.template.transformed_samples[i] = transformed_sample;
            } else {
                $scope.template.transformed_samples.push(transformed_sample);
            }
        }

        $scope.openSample = function (sample) {
            modalInstance.openModal(sample, 'sample', project);
        };

        $scope.openFile = function (file) {
            modalInstance.openModal(file, 'datafile', project);
        };

        $scope.cancel = function () {
            $state.go('projects.project.processes.list');
        };

        $scope.linkSample = function (datafile) {
            var i = _.indexOf($scope.template.input_samples, function (entry) {
                return $scope.bk.selectedSample.id === entry.id;
            });
            //check for redundancy
            var k = _.indexOf($scope.template.input_samples[i].files, function (entry) {
                return datafile.datafile_id === entry.datafile_id;
            });

            if (k < 0) {
                if (i > -1) {
                    $scope.template.input_samples[i].files.push({id: datafile.datafile_id, name: datafile.name});
                    $scope.bk.selectedSample = '';
                }
            }
        };

        $scope.removeLink = function (sample, file) {
            var k = _.indexOf($scope.template.input_samples, function (entry) {
                return sample.id === entry.id;
            });
            var i = _.indexOf($scope.template.input_samples[k].files, function (entry) {
                return file.datafile_id === entry.datafile_id;
            });
            $scope.template.input_samples[k].files.splice(i, 1);
            $scope.bk.selectedSample = '';
        };

        function updateSampleMeasurement(sample) {
            var i = _.indexOf($scope.template.input_samples, function (entry) {
                return sample.id === entry.id;
            });
            $scope.template.input_samples[i] = sample;
        }

        function addAttachment(item) {
            var what;
            switch (item.type) {
            case "sample":
                what = 'input_samples';
                item.new_properties = [];
                item.old_properties = [];
                item.transformed_properties = [];
                item.files = [];
                item.property_set_id = item.property_set_id;
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
                spliceItem(item, what);
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
                }
                break;
            }
        };

        function spliceItem(item, what) {
            var i = _.indexOf($scope.template[what], function (entry) {
                return item.id === entry.id;
            });
            if (i > -1) {
                $scope.template[what].splice(i, 1);
            }
        }

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

        $scope.showLineChart = function (property) {
            $scope.modal = {
                instance: null,
                property: property
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/processes/line.html',
                controller: 'lineGraphController',
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

        $scope.showHistogram = function (property) {
            $scope.modal = {
                instance: null,
                property: property
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/processes/histogram.html',
                controller: 'histogramController',
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

        $scope.showLineGraph = function (property) {
            $scope.modal = {
                instance: null,
                property: property
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/processes/line.html',
                controller: 'lineGraphController',
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
            $scope.isProcessing = true;
            if ($scope.template._type === 'as_received') {
                $scope.template.output_samples.push($scope.bk.newSample);
            } else {
                //$scope.template = refineSampleProperties();
                if ($scope.template.transformed_samples.length !== 0) {
                    $scope.template.transformed_samples = refineTransformedSamples();
                }
            }
            $scope.template.input_files = refineFiles($scope.template.input_files);
            $scope.template.output_files = refineFiles($scope.template.output_files);
            refineSetUpProperties();
            console.dir($scope.template);
            mcapi('/projects2/%/processes', project.id)
                .success(function (proc) {
                    measurements.reset();
                    $scope.isProcessing = false;
                    //After you create a process try to update the whole project.
                    // Because samples, processes should be refreshed in
                    // order for user to create another process.

                    //Currently i'm reloading all the projects , but we need to reload single project.
                    Projects.getList(true).then(function (projects) {
                        var i = _.indexOf(projects, function (p) {
                            return p.id == project.id;
                        });
                        current.setProject(projects[i]);
                        project.processes = projects[i].processes;
                        project.samples = projects[i].samples;
                        $scope.template = '';
                        $scope.bk = {
                            selectedSample: {}
                        };
                        $state.go('projects.project.processes.list');
                    });
                })
                .error(function (err) {
                    $scope.template = '';
                    console.log("err");
                    console.log(err);
                })
                .post($scope.template);
        };

        function refineSetUpProperties() {
            $scope.settings = $scope.template.setup.settings[0].properties;
            $scope.template.setup.settings[0].properties = [];
            $scope.settings.forEach(function (property) {
                if (property.property.value !== null) {
                    $scope.template.setup.settings[0].properties.push(property)
                }
            })

        }

        function refineSampleProperties() {
            $scope.template.input_samples.forEach(function (sample) {
                sample.properties = refine(sample.properties);
                sample.new_properties = refine(sample.new_properties);
            });
            if ($scope.template.transformed_samples.length !== 0) {
                $scope.template.transformed_samples = refineTransformedSamples();
            }
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
                items.push({id: file.datafile_id, name: file.name, path: file.path});
            });
            return items;
        }

        function refineTransformedSamples() {
            $scope.template.transformed_samples.forEach(function (sample) {
                sample.shares = transformActions(sample.shares);
                sample.uses = transformActions(sample.uses);
                sample.unknowns = transformActions(sample.unknowns);
                sample.deletes = transformActions(sample.deletes);
            });
            return $scope.template.transformed_samples;
        }

        function transformActions(properties) {
            var transform = [];
            properties.forEach(function (property) {
                transform.push(property.id);
            });
            return transform;
        }

        function init() {
            $scope.template = processTemplates.getActiveTemplate();
            $scope.template.name = $scope.template.name + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
            measurements.templates();
            $scope.bk = {
                selectedSample: {},
                newSample: {}
            };
            $scope.isEmptyTemplate = _.isEmpty($scope.template);
            if ($scope.isEmptyTemplate === true) {
                $state.go('projects.project.processes.list')
            }
            $scope.project = project;
        }

        $scope.linkFilesToSample = linkFilesToSample;

        init();


        /////////

        function linkFilesToSample(files, sample) {
            var modal = $modal.open({
                templateUrl: 'application/core/projects/project/processes/link-files-to-sample.html',
                controller: 'LinkFilesToSampleController',
                controllerAs: 'sample',
                resolve: {
                    files: function () {
                        return files;
                    },
                    sampleName: function () {
                        return sample.name;
                    },
                    project: function () {
                        return project;
                    }
                }
            });
            modal.result.then(function (linkedFiles) {
                linkedFiles.forEach(function (f) {
                    sample.files.push({id: f.datafile_id, name: f.name});
                })
            });
        }
    }

    module.controller("LinkFilesToSampleController", LinkFilesToSampleController);
    LinkFilesToSampleController.$inject = ["$modalInstance", "project", "files", "sampleName", "modalInstance"];

    function LinkFilesToSampleController($modalInstance, project, files, sampleName, modalInstance) {
        var ctrl = this;
        ctrl.name = sampleName;
        ctrl.files = files;
        ctrl.ok = ok;
        ctrl.cancel = cancel;
        ctrl.filesToLink = [];
        ctrl.linkFile = linkFile;
        ctrl.unlinkFile = unlinkFile;
        ctrl.linkAllFiles = linkAllFiles;
        ctrl.unlinkAllFiles = unlinkAllFiles;
        ctrl.openFile = openFile;

        files.forEach(function (f) {
            f.linked = false;
        });

        /////////

        function ok() {
            $modalInstance.close(ctrl.filesToLink);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function linkFile(file) {
            file.linked = true;
            ctrl.filesToLink.push(file);
        }

        function unlinkFile(file) {
            var i = _.indexOf(ctrl.filesToLink, function (f) {
                return f.datafile_id == file.datafile_id;
            });

            if (i !== -1) {
                file.linked = false;
                ctrl.filesToLink.splice(i, 1);
            }
        }

        function linkAllFiles() {
            ctrl.filesToLink = [];
            ctrl.files.forEach(function (f) {
                f.linked = true;
                ctrl.filesToLink.push(f);
            });
        }

        function unlinkAllFiles() {
            ctrl.files.forEach(function (f) {
                f.linked = false;
            });
            ctrl.filesToLink = [];
        }

        function openFile(file) {
            modalInstance.openModal(file, 'datafile', project);
        }
    }
}(angular.module('materialscommons')));
