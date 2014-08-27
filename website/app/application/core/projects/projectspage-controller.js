Application.Controllers.controller('Projects',
                                   ["$scope", "$stateParams", "mcapi", "$state", "watcher",
                                    "ProjectPath", "pubsub", "model.Projects", "$timeout", ProjectsController]);
function ProjectsController ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, $timeout) {
    $scope.project_id = $stateParams.id;
    $scope.model = {
        action: ''
    };

    watcher.watch($scope, 'model.action', function (choice) {
        if (choice === 'prov') {
            $state.go('projects.provenance');
        }
    });

    $scope.createProject = function(){
        if ($scope.bk.name === "") {
            return;
        }
        mcapi('/projects')
            .success(function (data) {
                Projects.getList(true).then(function(projects) {
                    $scope.projects = projects;
                });
            }).post({'name': $scope.bk.name});
    };

    $scope.setColor = function(color) {
        console.log("setColor called: " + color);
        $scope.activeColor = color;
    };

    function init() {
        $scope.bk= {
            name: ''
        };
        $scope.colors = {};
        $scope.colors["AZ91 Precipitation Evolution"] = "#CDA7D8";
        $scope.colors["Data"] = "#68c3a3";
        $scope.colors["DislocationDFT"] = "#eb974e";
        $scope.colors["EBSD"] = "#f5d76e";
        $scope.from = ProjectPath.get_from();
        Projects.getList().then(function (data) {
            $scope.model = {
                action: ''
            };
            $scope.projects = data.slice(0,4);
            if ($scope.projects.length === 0) {
                return;
            }
            if (!($stateParams.id)) {
                $stateParams.id = $scope.projects[0].id;
            }
            pubsub.send("project.tree", true);
            $scope.project_id = $stateParams.id;

            //tabset not preserving active project on page refresh
            $scope.projects.forEach(function (item) {
                if (item.id === $stateParams.id) {
                    item.active = true;
                }
                else {
                    item.active = false;
                }
            });
            if ($stateParams.draft_id !== "") {
                $state.go('projects.provenance.process');
            } else {
                $state.go('projects.overview.files', {id: $scope.project_id, draft_id: ''});
            }
        });
    }

    init();
}
