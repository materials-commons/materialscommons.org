Application.Controllers.controller('toolbarProjectsPageOverviewSamples',
    ["$scope", "mcapi", "$injector", "model.Projects", "alertService", "User", "$stateParams",
        function ($scope, mcapi, $injector, Projects, alertService, User, $stateParams) {
            var $validationProvider = $injector.get('$validation');


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


            $scope.addTreatment = function () {
                var o = angular.copy($scope.bk.selected_treatment);
                $scope.bk.selected_treatment = '';
                $scope.default_properties = "";
                $scope.doc.treatments.push(o);
            };

            $scope.save = function (form) {
                var check = $validationProvider.checkValid(form);
                $scope.doc.path = $scope.doc.name;
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

            $scope.refreshProjects = function () {
                mcapi('/samples/project/%', $scope.sample.id)
                    .success(function (data) {
                        $scope.projects_by_sample = data;
                    }).jsonp();
            };
            $scope.refreshProcesses = function () {
                mcapi('/processes/sample/%', $scope.sample.id)
                    .success(function (data) {
                        $scope.processes_by_sample = data;
                    }).jsonp();
            };
            $scope.showTreatmentDetails_and_processes = function (sample) {
                $scope.sample = sample;
                $scope.refreshProcesses();
                $scope.refreshProjects();

            };

            $scope.clear = function () {
                $scope.doc = {
                    name: '',
                    path: '',
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

            $scope.addProject = function () {
                $scope.sample_project = {
                    'sample_id': $scope.sample.id,
                    'project_id': $scope.model.selected_project.id,
                    'project_name': $scope.model.selected_project.name
                }
                mcapi('/sample/project/join', $scope.sample.id, $scope.model.selected_project.id, $scope.model.selected_project.name)
                    .success(function (data) {
                        $scope.refreshProjects();
                    }).post($scope.sample_project)
            };

            $scope.deleteProject = function (index) {
                mcapi('/object/%/project/%/remove', $scope.sample.id, $scope.sample.projects[index].id)
                    .success(function (data) {
                        alertService.sendMessage("Project has been deleted");
                        $scope.refreshProjects();
                    }).error(function () {
                    }).put();
            };

            function init() {
                $scope.doc = {
                    name: '',
                    notes: [],
                    available: true,
                    default_properties: [],
                    added_properties: [],
                    projects: [],
                    treatments: []
                };
                $scope.bk = {
                    selected_project: ''
                };
                //initialize the sample with default project
                $scope.project_id = $stateParams.id;
                mcapi('/projects/%', $scope.project_id)
                    .success(function (data) {
                        $scope.project = data;
                        $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
                    }).jsonp();
                $scope.signed_in_user = User.u();
                $scope.processes_list = [];
                $scope.projects_by_sample = [];
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
                mcapi('/samples/by_project/%', $scope.project_id)
                    .success(function (data) {
                        $scope.samples_list = data;
                    }).jsonp();

                Projects.getList().then(function (data) {
                    $scope.projects = data;
                });
            }

            init();
        }]);
