//var mod = angular.module("materialsdirective", []);


//
//md.directive('cgroup', function () {
//    return {
//        restrict: "E",
//        transclude: true,
//        scope: {
//            label: '@label'
//        },
//        template: '<div class="control-group">' +
//            '<label class="control-label">{{ label }}</label>' +
//            '<div class="controls" ng-transclude>' +
//            '</div>' +
//            '</div>'
//    }
//});

//var mod = angular.module('mcdirectives', []);
//mod.directive('treetable', function ($timeout) {
//    return {
//        restrict: 'A',
//        scope: {
//            treedata: '='
//        },
//        link: function (scope, element) {
//            scope.$watch('treedata', function (newValue, oldValue) {
//                if (newValue) {
//                    $timeout(function () {
//                        $(element).treetable({expandable: true}, true);
//                    }, 0);
//                }
//            });
//        }
//    };
//});
//
//mod.directive('checkFocus', function () {
//    return function (scope, element, attrs) {
//        scope.$watch(attrs.checkFocus,
//            function (newValue) {
//                newValue && element.focus();
//            }, true);
//    };
//});
//
//var mctree = angular.module('mctree', ['materialsCommonsServices', 'stateServices']);
//mctree.controller("ProjectTreeController", ["$scope", "mcapi", "Projects", "pubsub",
//    function ($scope, mcapi, Projects, pubsub) {
//        $scope.model = Projects.model;
//
//        $scope.openFolder = function (item) {
//            var e = _.find($scope.trail, function (trailItem) {
//                return trailItem.id === item.id;
//            });
//            if (typeof e === 'undefined') {
//                // first level is 0 so we need to add 1 to our test
//                if (item.level + 1 <= $scope.trail.length) {
//                    // Remove everything at this level and above
//                    $scope.trail = $scope.trail.splice(0, item.level);
//                }
//                $scope.trail.push(item);
//            }
//            $scope.dir = item.children;
//        };
//
//        $scope.backToFolder = function(item) {
//            $scope.dir = item.children;
//        };
//
//        $scope.selectProject = function(projectId) {
//            $scope.trail = [];
//            $scope.projectId = projectId;
//            $scope.tree_data = [];
//            $scope.loaded = false;
//            if (!(projectId in $scope.model.projects)) {
//                mcapi('/projects/%/tree2', projectId)
//                    .success(function(data) {
//                        if (data[0]) {
//                            $scope.tree_data = data;
//                            $scope.dir = $scope.tree_data[0].children;
//                            var obj = {};
//                            obj.dir = $scope.dir;
//                            $scope.model.projects[projectId] = obj;
//                            $scope.loaded = true;
//                            $scope.trail.push(data[0]);
//                        }
//                    }).jsonp();
//            } else {
//                $scope.loaded = true;
//                $scope.dir = $scope.model.projects[projectId].dir;
//            }
//        };
//
//        $scope.fileSelected = function(entry) {
//            entry.selected = !entry.selected;
//            var channel = Projects.channel;
//            if (channel != null) {
//                pubsub.send(channel, entry);
//            }
//
//        };
//
//        $scope.selectProject($scope.project);
//    }]);
//
//mctree.directive('projectTree', function () {
//    return {
//        restrict: "E",
//        controller: "ProjectTreeController",
//        transclude:false,
//        link: function($scope, $element, $attrs) {
//            //$scope.project = $attrs.project;
//            //console.log("link project = " + $scope.project);
//        },
//        replace: true,
//        scope: {
//            ngModel: "@",
//            project: "@project"
//        },
//        templateUrl: "../templates/projectTree/projectTree.html"
//    }
//});
//

