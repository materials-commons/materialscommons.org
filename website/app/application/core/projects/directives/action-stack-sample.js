Application.Directives.directive('actionSample', actionSampleDirective);

function actionSampleDirective() {
    return {
        scope: {},
        controller: "actionSampleController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-sample.html"
    };
}

Application.Controllers.controller('actionSampleController',
    ["$scope", "mcapi", "$stateParams", "User", "model.Projects","$injector", actionSampleController]);

function actionSampleController($scope,mcapi,$stateParams,User, Projects, $injector) {
    var $validationProvider = $injector.get('$validation');
    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.setDefaultProject = function () {
        $scope.doc = {
            name: '',
            notes: [],
            available: true,
            projects: [],
            composition: {'value': [], 'unit': ''},
            properties: {}
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
        $scope.sample = sample;
        $scope.refreshProcesses();
        $scope.refreshProjects();

    };
    $scope.showForm = function () {
        $scope.default_properties = $scope.bk.selected_treatment.default_properties;
        $scope.bk.tab_item = '';
    };

    $scope.showTab = function (item, index) {
        $scope.bk.tab_item = item.id;
        $scope.bk.tab_details = $scope.doc.treatments[index];
        $scope.default_properties = $scope.doc.treatments[index].default_properties;
        $scope.bk.selected_treatment = item;
    };

    $scope.addTreatment = function () {
        var i = _.indexOf($scope.doc.treatments, function (item) {
            return (item.id === $scope.bk.selected_treatment.id);
        });
        if (i === -1){
            var o = angular.copy($scope.bk.selected_treatment);
            $scope.doc.treatments.push(o);
        }
        if (i !== -1){
            $scope.doc.treatments[i] = $scope.bk.selected_treatment;
        }
        $scope.bk.selected_treatment = '';
        $scope.default_properties = "";
    };

    $scope.setProperties = function () {
        $scope.doc.default_properties = $scope.bk.classification.default_properties;
        $scope.doc.template = $scope.bk.classification.id;

    };
    $scope.save = function (form) {
        console.dir($scope.doc)
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
                            $scope.toggleCustom = false;
                        }).jsonp();
                    init();
                }).post($scope.doc);
        }
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
        //$scope.refreshSamples();

        Projects.getList().then(function (data) {
            $scope.projects = data;
        });
    }

    init();
}
