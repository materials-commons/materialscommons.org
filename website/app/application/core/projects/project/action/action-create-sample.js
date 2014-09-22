Application.Directives.directive('actionCreateSample', actionCreateSample);

function actionCreateSample() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateSampleController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-sample.html"
    };
}

Application.Controllers.controller('actionCreateSampleController',
                                   ["$scope", "mcapi", "model.projects", "actionStatus", "toastr","pubsub", actionCreateSampleController]);

function actionCreateSampleController($scope,mcapi, Projects, actionStatus, toastr, pubsub) {

    function setDefaultProject() {
        $scope.doc = {
            name: '',
            notes: [],
            available: true,
            projects: [],
            properties: {'composition': {'value': [], 'unit': ''}}
        };

        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: ''
        };
        $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
    }

    $scope.save = function () {
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = $scope.project.id;
        mcapi('/objects/new')
            .arg('order_by=birthtime')
            .success(function () {
                Projects.getList(true).then(function (data) {
                    setDefaultProject();
                    actionStatus.toggleAction($scope.project.id, 'create-sample');
                    pubsub.send('update-tab-count.change');
                });
            }).post($scope.doc);
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.cancel = function () {
        setDefaultProject();
        actionStatus.toggleAction($scope.project.id, 'create-sample');
    };

    $scope.removeProjects = function (index) {
        $scope.doc.projects.splice(index, 1);
    };

    function init() {
        setDefaultProject();
        Projects.getList().then(function (projects) {
            $scope.projects = projects;
        });
    }

    init();
}
