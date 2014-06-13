Application.Controllers.controller('toolbarObjects',
    ["$scope", "mcapi", "$injector", "Nav", "model.Projects", "alertService","User",
        function ($scope, mcapi, $injector, Nav, Projects, alertService, User) {

        $scope.refreshProjects = function () {
            mcapi('/objects/%', $scope.sample.id)
                .success(function (data) {
                    $scope.projects_by_sample = data.projects;
                }).jsonp();

        };
        $scope.refreshProcesses = function(){
            mcapi('/processes/sample/%', $scope.sample.id)
                .success(function (data) {
                    $scope.processes_list = data;
                    console.log($scope.processes_list)
                }).jsonp();
        };
        $scope.showForm = function () {
            $scope.default_properties = $scope.bk.selected_treatment.default_properties;
            $scope.bk.tab_item = '';
        };

        $scope.showTab = function (item, index) {
            $scope.bk.tab_item = item.id;
            $scope.bk.tab_details = $scope.doc.treatments[index];
            $scope.default_properties = $scope.doc.treatments[index].default_properties;
            $scope.bk.selected_treatment = {};
        };

        function clearTreatment(treatment) {
            treatment.additional_properties.forEach(function (attr) {
                attr.value = "";
                if (attr.unit_choice.length > 0) {
                    attr.unit = "";
                }
            });

            treatment.default_properties.forEach(function (attr) {
                attr.value = "";
                if (attr.unit_choice.length > 0) {
                    attr.unit = "";
                }
            });
        }

        $scope.addTreatment = function () {
            var o = angular.copy($scope.bk.selected_treatment);
            clearTreatment($scope.bk.selected_treatment);
            $scope.bk.selected_treatment = '';
            $scope.default_properties = "";
            $scope.doc.treatments.push(o);
        };

        $scope.save = function (form) {
            var $validationProvider = $injector.get('$validation');
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/objects/new')
                    .arg('order_by=birthtime')
                    .success(function (data) {
                        mcapi('/objects/%', data.id)
                            .success(function (sample_obj) {
                                $scope.message = "Object has been saved.";
                                $scope.samples_list.unshift(sample_obj);
                            })
                            .error(function (e) {
                            }).jsonp();
                        $scope.clear();
                    })
                    .error(function (e) {

                    }).post($scope.doc);
            } else {
                $validationProvider.validate(form);
            }
        };
        $scope.setProperties = function () {
            $scope.doc.default_properties = $scope.bk.classification.default_properties;
            $scope.doc.template = $scope.bk.classification.id;

        };
        $scope.showTreatmentDetails_and_processes = function (sample) {
            $scope.sample = sample;
            $scope.refreshProcesses();
            $scope.refreshProjects();

        };


        $scope.clear = function () {
            $scope.doc = {
                name: '',
                notes: [],
                available: true,
                default_properties: [],
                added_properties: [],
                treatments: [],
                projects: []
            };
            $scope.bk = {
                selected_treatment: '',
                selected_project: '',
                tab_details: [],
                tab_item: '',
                classification: '',
                new_note: ''
            };
        };

            $scope.populateProjects = function () {
                $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
            };
            $scope.removeProjects = function (index) {
                $scope.doc.projects.splice(index, 1);
            };

            $scope.addProject = function (prj) {
            mcapi('/object/%/project/%', $scope.sample.id, $scope.model.selected_project.id)
                .success(function (data) {
                    $scope.refreshProjects()
                }).error(function (data) {
                    alertService.sendMessage(data.error);
                }).put();
        };

        $scope.deleteProject = function (index) {
            mcapi('/object/%/project/%/remove',$scope.sample.id, $scope.sample.projects[index].id)
                .success(function (data) {
                    alertService.sendMessage("Project has been deleted");
                    $scope.refreshProjects();
                }).error(function () {
                }).put();
        };

        function init() {
            Nav.setActiveNav('Objects');
            $scope.signed_in_user = User.u()
            $scope.doc = {
                name: '',
                notes: [],
                available: true,
                default_properties: [],
                added_properties: [],
                treatments: [],
                projects: []
            };
            $scope.bk = {
                projects_by_sample: [],
                selected_project: ''

            }
            $scope.clear();
            mcapi('/templates')
                .argWithValue('filter_by', '"template_pick":"treatment"')
                .success(function (data) {
                    $scope.treatment_templates = data;
                })
                .error(function (e) {

                }).jsonp();
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"material"')
                .success(function (data) {
                    $scope.sample_templates = data;
                })
                .error(function (e) {

                }).jsonp();
            mcapi('/objects')
                .success(function (data) {
                    $scope.samples_list = data;
                })
                .error(function (data) {
                }).jsonp();
            Projects.getList().then(function (data) {
                $scope.projects = data;
            });
        }

        init();
    }]);
