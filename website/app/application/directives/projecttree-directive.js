Application.Controllers.controller('ProjectTreeController',
    ["$scope", "mcapi", "Projects", "pubsub", function ($scope, mcapi, Projects, pubsub) {
        $scope.model = Projects.model;

        pubsub.waitOn($scope, "project.tree", function (treeVisible) {
            $scope.treeActive = treeVisible;
        });

        $scope.openFolder = function (item) {
            var e = _.find($scope.trail, function (trailItem) {
                return trailItem.id === item.id;
            });
            if (typeof e === 'undefined') {
                // first level is 0 so we need to add 1 to our test
                if (item.level + 1 <= $scope.trail.length) {
                    // Remove everything at this level and above
                    $scope.trail = $scope.trail.splice(0, item.level);
                }
                $scope.trail.push(item);
            }
            $scope.dir = item.children;
        };

        $scope.backToFolder = function (item) {
            $scope.dir = item.children;
        };

        $scope.selectProject = function (projectId) {
            $scope.trail = [];
            $scope.projectId = projectId;
            $scope.tree_data = [];
            $scope.loaded = false;
            if (!(projectId in $scope.model.projects)) {
                mcapi('/projects/%/tree2', projectId)
                    .success(function (data) {
                        if (data[0]) {
                            $scope.tree_data = data;
                            $scope.dir = $scope.tree_data[0].children;
                            var obj = {};
                            obj.dir = $scope.tree_data[0];
                            $scope.model.projects[projectId] = obj;
                            $scope.loaded = true;
                            $scope.trail.push(data[0]);
                        }
                    }).jsonp();
            } else {
                $scope.loaded = true;
                $scope.dir = $scope.model.projects[projectId].dir.children;
                $scope.trail.push($scope.model.projects[projectId].dir);
            }
        };

        $scope.fileSelected = function (entry) {
            entry.selected = !entry.selected;
            var channel = Projects.channel;
            if (channel !== null) {
                pubsub.send(channel, entry);
            }

        };

        $scope.selectProject($scope.project);
    }]);

Application.Directives.directive('projectTree',
    function () {
        return {
            restrict: "E",
            controller: "ProjectTreeController",
            transclude: false,
            link: function ($scope, $element, $attrs) {
            },
            replace: true,
            scope: {
                ngModel: "@",
                project: "@project",
                treeActive: "@active"
            },
            templateUrl: "application/directives/projecttree.html"
        };
    });


