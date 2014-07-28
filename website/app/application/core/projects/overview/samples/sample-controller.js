Application.Controllers.controller('projectsOverviewSamples',
    ["$scope", "mcapi", "$injector", "model.Projects", "alertService", "User", "$stateParams",
        function ($scope, mcapi, $injector, Projects, alertService, User, $stateParams) {
            var $validationProvider = $injector.get('$validation');
            $scope.showForm = function () {
                $scope.default_properties = $scope.bk.selected_treatment.default_properties;
                $scope.bk.tab_item = '';
            };

            $scope.showTab = function (item, index) {
                $scope.bk.tab_item = item.id;
                $scope.bk.tab_details = $scope.bk.treatments[index];
                $scope.default_properties = $scope.bk.treatments[index].default_properties;
                $scope.bk.selected_treatment = {};
            };


            $scope.addTreatment = function () {
                var o = angular.copy($scope.bk.selected_treatment);
                $scope.bk.selected_treatment = '';
                $scope.default_properties = "";
                $scope.bk.treatments.push(o);
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
            $scope.processDetails = function(p_id){
                mcapi('/processes/%', p_id)
                    .success(function (data) {
                        $scope.process = []
                        $scope.process.push(data);
                    })
                    .error(function(e){
                    }).jsonp();
            }


            $scope.populateProjects = function () {
                $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
            };

            $scope.addProject = function () {
                $scope.sample_project = {
                    'sample_id': $scope.sample.id,
                    'project_id': $scope.model.selected_project.id,
                    'project_name': $scope.model.selected_project.name
                };
                mcapi('/sample/project/join', $scope.sample.id, $scope.model.selected_project.id, $scope.model.selected_project.name)
                    .success(function (data) {
                        $scope.refreshProjects();
                    }).post($scope.sample_project);
            };

            $scope.deleteProject = function (index) {
                mcapi('/object/%/project/%/remove', $scope.sample.id, $scope.sample.projects[index].id)
                    .success(function (data) {
                        alertService.sendMessage("Project has been deleted");
                        $scope.refreshProjects();
                    }).error(function () {
                    }).put();
            };

            $scope.editAvailability = function(sample){
                $scope.chosen_sample = sample
            }

            $scope.updateAvailability = function(){
                if ($scope.bk.available == 1){
                    mcapi('/objects/%', $scope.chosen_sample.id)
                        .success(function () {
                            $scope.refreshSamples()
                            $scope.chosen_sample = ''
                        })
                        .error(function () {
                        }).put({'available': 1 })
                }else{
                    mcapi('/objects/%', $scope.chosen_sample.id)
                        .success(function () {
                            $scope.refreshSamples()
                            $scope.chosen_sample = ''
                        })
                        .error(function () {

                        }).put({'available': 2})
                }
            }

            $scope.refreshSamples = function(){
                mcapi('/samples/by_project/%', $scope.project_id)
                    .success(function (data) {
                        $scope.samples_list = data;
                    }).jsonp();
            }

            $scope.clear = function () {
                $scope.setDefaultProject()
            };
            $scope.save = function (form) {
                console.log('yes')
                var check = $validationProvider.checkValid(form);
                console.log(check)
                console.dir($scope.doc)
                $scope.doc.path = $scope.doc.name;
                $scope.doc.treatments = $scope.bk.treatments
                if (check === true) {
                    mcapi('/objects/new')
                        .arg('order_by=birthtime')
                        .success(function (data) {
                            mcapi('/objects/%', data.id)
                                .success(function (sample_obj) {
                                    console.log('inside ')
                                    $scope.message = "New Sample has been saved.";
                                    $scope.samples_list.unshift(sample_obj);
                                    $scope.toggleCustom = false;
                                }).jsonp();
                            init()
                        }).post($scope.doc);
                } else {
                    $validationProvider.validate(form);
                }
            };

            $scope.setDefaultProject = function () {
                $scope.doc = {
                    name: '',
                    notes: [],
                    available: true,
                    default_properties: [],
                    added_properties: [],
                    projects: [],
                    template: ''
                };
                $scope.bk = {
                    selected_project: '',
                    available: '',
                    open: '',
                    classification: '' ,
                    treatments: []
                };
                $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
            };
            function init() {
                //initialize the sample with default project
                $scope.project_id = $stateParams.id;
                mcapi('/projects/%', $scope.project_id)
                    .success(function (data) {
                        $scope.project = data;
                        $scope.setDefaultProject()
                    }).jsonp();

                $scope.signed_in_user = User.u();
                $scope.processes_list = [];
                $scope.projects_by_sample = [];
                mcapi('/templates')
                    .argWithValue('filter_by', '"template_pick":"treatment"')
                    .success(function (data) {
                        $scope.treatment_templates = data;
                    }).jsonp();
                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"material"')
                    .success(function (data) {
                        $scope.sample_templates = data;
                    }).jsonp();
                $scope.refreshSamples();

                Projects.getList().then(function (data) {
                    $scope.projects = data;
                });
            }

            init();
        }]);
