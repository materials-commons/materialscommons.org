Application.Directives.directive('actionShowSamples', actionShowSamplesDirective);

function actionShowSamplesDirective() {
    return {
        controller: "actionShowSamplesController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-show-samples.html"
    };
}

Application.Controllers.controller('actionShowSamplesController',
                                   ["$scope", "mcapi", "$injector", "model.projects", "$stateParams",
                                       "projectColors", actionShowSamplesController]);

function actionShowSamplesController($scope, mcapi, $injector, Projects, $stateParams, projectColors) {
    var $validationProvider = $injector.get('$validation');

    $scope.refreshProcesses = function () {
        mcapi('/processes/sample/%', $scope.sample.id)
            .success(function (data) {
                $scope.processes_by_sample = data;
            }).jsonp();
    };

    $scope.refreshSamples = function () {
        mcapi('/samples/by_project/%', $scope.project_id)
            .success(function (data) {
                $scope.samples_list = data;
            }).jsonp();
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

    $scope.showTreatmentDetails_and_processes = function (sample) {
        $scope.show = true;
        $scope.sample = sample;
        $scope.refreshProcesses();
    };
    function init() {
        $scope.color = projectColors.getCurrentProjectColor();
        $scope.project_id = $stateParams.id;
        $scope.refreshSamples();
        Projects.getList().then(function (data) {
            $scope.projects = data;
        });
    }

    init();
}
