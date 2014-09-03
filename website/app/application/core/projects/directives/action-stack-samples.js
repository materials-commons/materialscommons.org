Application.Directives.directive('actionSamples', actionSamplesDirective);

function actionSamplesDirective() {
    return {
        controller: "actionSamplesController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-samples.html"
    };
}

Application.Controllers.controller('actionSamplesController',
                                   ["$scope", "mcapi", "$injector", "model.Projects", "alertService",
                                    "User", "$stateParams", actionSamplesController]);

function actionSamplesController($scope, mcapi, $injector, Projects, alertService,
                                 User, $stateParams) {
    var $validationProvider = $injector.get('$validation');

    $scope.editAvailability = function (sample) {
        $scope.chosen_sample = sample;
    };

    $scope.updateAvailability = function () {
        if ($scope.bk.available == 1) {
            mcapi('/objects/%', $scope.chosen_sample.id)
                .success(function () {
                    $scope.refreshSamples();
                    $scope.chosen_sample = '';
                })
                .error(function () {
                }).put({'available': 1 });
        } else {
            mcapi('/objects/%', $scope.chosen_sample.id)
                .success(function () {
                    $scope.refreshSamples();
                    $scope.chosen_sample = '';
                })
                .error(function () {

                }).put({'available': 2});
        }
    };

    $scope.refreshSamples = function () {
        mcapi('/samples/by_project/%', $scope.project_id)
            .success(function (data) {
                $scope.samples_list = data;
            }).jsonp();
    };

    $scope.clear = function () {
        $scope.setDefaultProject();
    };

    $scope.save = function (form) {
        $validationProvider.validate(form);
        var check = $validationProvider.checkValid(form);
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = $scope.project_id;
        if (check === true) {
            mcapi('/objects/new')
                .arg('order_by=birthtime')
                .success(function (data) {
                    mcapi('/objects/%', data.id)
                        .success(function (sample_obj) {
                            $scope.message = "New Sample has been saved.";
                            $scope.samples_list.unshift(sample_obj);
                            $scope.toggleCustom = false;
                        }).jsonp();
                    init();
                }).post($scope.doc);
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
            template: '',
            treatments: []

        };

        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: ''
        };

        $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
    };
    $scope.showTreatmentDetails_and_processes = function (sample) {
        $scope.show = true;
        $scope.sample = sample;

    };
    function init() {
        //initialize the sample with default project
        $scope.project_id = $stateParams.id;
        mcapi('/projects/%', $scope.project_id)
            .success(function (data) {
                $scope.project = data;
                $scope.setDefaultProject();
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
}
