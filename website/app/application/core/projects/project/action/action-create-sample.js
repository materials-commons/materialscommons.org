Application.Directives.directive('actionCreateSample', actionCreateSample);

function actionCreateSample() {
    return {
        scope: {
            project: "="
        },
        replace: true,
        controller: "actionCreateSampleController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-sample.html"
    };
}

Application.Controllers.controller('actionCreateSampleController',
                                   ["$scope", "mcapi", "model.projects", "actionStatus",
                                    "pubsub", actionCreateSampleController]);

function actionCreateSampleController($scope, mcapi, Projects, actionStatus, pubsub) {

    $scope.onDrop = function(target, source) {
        if (source === "") {
            source = 0;
        }
        var sourceObject = $scope.events[source];
        // Remove the old item
        $scope.events.splice(source, 1);
        $scope.events.splice(target, 0, sourceObject);
    };

    function initializeState() {
        var state = actionStatus.getCurrentActionState($scope.project.id);
        if (state) {
            $scope.doc = state;
        } else {
            $scope.doc = {
                name: '',
                notes: [],
                available: true,
                projects: [],
                properties: {'composition': {'value': [], 'unit': ''}},
                showComposition: false
            };

            $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
            actionStatus.setCurrentActionState($scope.project.id, $scope.doc);
        }

        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: '' ,
            element_name: '',
            element_value: ''
        };
    }

    $scope.create = function () {
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = $scope.project.id;
        mcapi('/objects/new')
            .arg('order_by=birthtime')
            .success(function () {
                Projects.getList(true).then(function (data) {
                    actionStatus.clearCurrentActionState($scope.project.id);
                    actionStatus.toggleAction($scope.project.id, 'create-sample');
                    pubsub.send('update-tab-count.change');
                });
            }).post($scope.doc);
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.cancel = function () {
        actionStatus.clearCurrentActionState($scope.project.id);
        actionStatus.toggleAction($scope.project.id, 'create-sample');
    };

    $scope.removeProjects = function (index) {
        $scope.doc.projects.splice(index, 1);
    };

    $scope.addComposition = function () {
        $scope.doc.properties.composition.value.push({'element': $scope.bk.element_name, 'value': $scope.bk.element_value});

    };
    $scope.removeComposition = function (i) {
        $scope.doc.properties.composition.value.splice(i, 1);
    };

    function init() {
        initializeState();
        Projects.getList().then(function (projects) {
            $scope.projects = projects;
        });
        mcapi('/objects/elements')
            .success(function(data){
                $scope.elements = data;
            }).jsonp();

        $scope.events = [
            {
                name: "Heat Treatment A"
            },

            {
                name: "Heat Treatment B"
            },

            {
                name: "Cogged C"
            }
        ];
    }

    init();
}
