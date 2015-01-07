

Application.Directives.directive('createSample', createSampleDirective);
function createSampleDirective() {
    return {
        restrict: "EA",
        controller: 'createSampleDirectiveController',
        scope: {
            model: '=model'
        },
        templateUrl: 'application/core/projects/project/samples/create.html'
    };
}


Application.Controllers.controller('createSampleDirectiveController',
                                   ["$scope", "mcapi", "model.projects", "projectState", "$stateParams",
                                    "recent", "current", createSampleDirectiveController]);

function createSampleDirectiveController($scope, mcapi, Projects, projectState, $stateParams, recent, current) {
    var stateID = $stateParams.sid;
    $scope.project = current.project();
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
        var defaultDoc = {
            name: '',
            notes: '',
            title: '',
            available: true,
            projects: [
                {'id': $scope.project.id, 'name': $scope.project.name}
            ],
            properties: {'composition': {'value': [], 'unit': ''}},
            showComposition: false
        };
        $scope.doc = defaultDoc;
        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: '' ,
            element_name: '',
            element_value: ''
        };
        recent.addIfNotExists($scope.project.id, stateID, "New Sample");
    }

    $scope.create = function () {
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = $scope.project.id;
        mcapi('/objects/new')
            .success(function (sample) {
                $scope.project.samples.unshift(sample);
                $scope.project.notes.push(sample.notes);
                recent.gotoLast($scope.project.id);
                recent.delete($scope.project.id, stateID);
                projectState.delete($scope.project.id, stateID);
                $scope.model.createSample = false;
                initializeState();
            }).post($scope.doc);
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.cancel = function () {
        projectState.delete($scope.project.id, stateID);
        recent.delete($scope.project.id, stateID);
        recent.gotoLast($scope.project.id);
        $scope.model.createSample = false;
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
        $scope.activeToolbarItem = "";
        initializeState();
        Projects.getList().then(function (projects) {
            $scope.projects = projects;
        });
        mcapi('/objects/elements')
            .success(function(data){
                $scope.elements = data;
            }).jsonp();
    }

    init();
}
