Application.Controllers.controller('projectSamplesCreate',
                                   ["$scope", "mcapi", "model.projects", "projectState", "$stateParams",
                                    "pubsub", "ui", "recent", projectSamplesCreate]);

function projectSamplesCreate($scope, mcapi, Projects, projectState, $stateParams, pubsub, ui, recent) {
    var stateID = $stateParams.id;

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
        var state = projectState.get($scope.project.id, stateID);
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
            projectState.set($scope.project.id, stateID, $scope.doc);
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
                    ui.setShowFiles($scope.project.id, true);
                    pubsub.send('update-tab-count.change');
                });
            }).post($scope.doc);
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.cancel = function () {
        ui.setShowFiles($scope.project.id, true);
        console.log("last = %O", recent.getLast($scope.project.id));
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
