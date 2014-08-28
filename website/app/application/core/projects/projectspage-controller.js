Application.Controllers.controller('Projects',
                                   ["$scope", "$stateParams", "mcapi", "$state", "watcher",
                                    "ProjectPath", "pubsub", "model.Projects", "$timeout",
                                    "$rootScope", ProjectsController]);
function ProjectsController ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, $timeout, $rootScope) {
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

    $scope.setActiveIndex = function(index) {
        $rootScope.currentProjectColor = $rootScope.projectColors[index];
        $rootScope.currentProjectColorLight = $rootScope.projectColorsLight[index];
        $rootScope.currentProjectIndex = index;
    };

    $scope.isActiveProject = function(index) {
        return index === $rootScope.currentProjectIndex;
    };

    $scope.getActiveStyle = function(index) {
        return {
            background: $rootScope.projectColors[index],
            //'border-bottom-width': '10px',
            'border-bottom-style': 'solid',
            'border-bottom-color': $rootScope.projectColors[index]
        };
    };

    $scope.getInactiveStyle = function(index) {
        return {
            background: $rootScope.projectColorsLight[index]
        };
    };

    $scope.createName = function(name) {
        if (name.length > 15) {
            return name.substring(0,12)+"...";
        }
        return name;
    };

    function init() {
        $scope.bk= {
            name: ''
        };
        $scope.from = ProjectPath.get_from();
        Projects.getList().then(function (data) {
            $scope.model = {
                action: ''
            };
            $scope.projects = data.slice(0,8);
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
