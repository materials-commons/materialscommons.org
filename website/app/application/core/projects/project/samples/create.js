Application.Controllers.controller('projectSamplesCreate',
                                   ["$scope", "mcapi", "model.projects", "projectState", "$stateParams",
                                    "recent", "project", projectSamplesCreate]);

function projectSamplesCreate($scope, mcapi, Projects, projectState, $stateParams, recent, project) {
    var stateID = $stateParams.sid;

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
            notes: [],
            available: true,
            projects: [
                {'id': project.id, 'name': project.name}
            ],
            properties: {'composition': {'value': [], 'unit': ''}},
            showComposition: false
        };
        $scope.doc = projectState.getset(project.id, stateID, defaultDoc);
        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: '' ,
            element_name: '',
            element_value: ''
        };
        recent.addIfNotExists(project.id, stateID, "New Sample");
    }

    $scope.create = function () {
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = project.id;
        mcapi('/objects/new')
            .success(function (sample) {
                project.samples.push(sample);
                recent.gotoLast(project.id);
                recent.delete(project.id, stateID);
                projectState.delete(project.id, stateID);
            }).post($scope.doc);
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.cancel = function () {
        projectState.delete(project.id, stateID);
        recent.delete(project.id, stateID);
        recent.gotoLast(project.id);
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

        // $scope.events = [
        //     {
        //         name: "Heat Treatment A"
        //     },

        //     {
        //         name: "Heat Treatment B"
        //     },

        //     {
        //         name: "Cogged C"
        //     }
        // ];
    }

    init();
}
