var md = angular.module("materialsdirective", []);

md.directive('wordcloud', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: { list: '=wordcloud' },

        link: function (scope, element) {
            scope.$watch('list', function (list) {
                if (list) {
                    $(element).jQCloud(list, {});
                }
            });

        }
    };
});

md.directive('datepicker', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.datepicker();
            element.bind('changeDate', function () {
                scope.$apply(function () {
                    scope[attrs.ngModel] = element.val()
                });
            })
        }
    };
});

md.directive('bs:popover', function (expression, compiledElement) {
    return function (linkElement) {
        linkElement.popover();
    };
});


md.directive('notification', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="alert fade" bs-alert="ngModel"></div>',
        link: function (scope, element) {
            scope.$watch('ngModel', function () {
                element.show();
                $timeout(function () {
                    element.hide();
                }, 3000);
            });
        }
    }
});

md.directive('paged', function () {
    return {
        template: '<div>' +
            '<div ng-transclude=""></div>' +
            '<div ng-show="data.length > pageSize">' +
            '<button ng-disabled="!hasPreviousPage()" ng-click="previousPage()"> Previous </button>' +
            '{{showStart()}} - {{end()}} out of {{size()}}' +
            '<button ng-disabled="!hasNextPage()" ng-click="nextPage()"> Next </button>' +
            '</div>' +
            '</div>',
        restrict: 'E',
        transclude: true,
        scope: {
            'currentPage': '=',
            'pageSize': '=',
            'data': '='
        },
        link: function ($scope, element, attrs) {
            $scope.size = function () {
                return $scope.data.length;
            }

            $scope.end = function () {
                var endItem = $scope.start() + $scope.pageSize;
                return endItem > $scope.size() ? $scope.data.length : endItem;
            }

            $scope.start = function () {
                return $scope.currentPage * $scope.pageSize;
            }

            $scope.showStart = function () {
                var s = $scope.start();
                return s + 1;
            }

            $scope.page = function () {
                return $scope.size() ? ($scope.currentPage + 1) : 0;
            }

            $scope.hasNextPage = function () {
                return $scope.page() < ($scope.size() / $scope.pageSize);
            }

            $scope.nextPage = function () {
                $scope.currentPage = parseInt($scope.currentPage) + 1;
            }

            $scope.hasPreviousPage = function () {
                return $scope.currentPage != 0;
            }

            $scope.previousPage = function () {
                $scope.currentPage = $scope.currentPage - 1;
            }

            try {
                if (!angular.isDefined($scope.data)) {
                    $scope.data = [];
                }

                if (!angular.isDefined($scope.currentPage)) {
                    $scope.currentPage = 0;
                }

                if (!angular.isDefined($scope.pageSize)) {
                    $scope.pageSize = 10;
                }
            } catch (e) {
            }
        }
    }
});

md.directive('cgroup', function () {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            label: '@'
        },
        template: '<div class="control-group">' +
            '<label class="control-label">{{ label }}</label>' +
            '<div class="controls" ng-transclude>' +
            '</div>' +
            '</div>'
    }
});

var mod = angular.module('mcdirectives', []);
mod.directive('treetable', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            treedata: '='
        },
        link: function (scope, element) {
            scope.$watch('treedata', function (newValue, oldValue) {
                if (newValue) {
                    $timeout(function () {
                        $(element).treetable({expandable: true}, true);
                    }, 0);
                }
            });
        }
    };
});

mod.directive('checkFocus', function () {
    return function (scope, element, attrs) {
        scope.$watch(attrs.checkFocus,
            function (newValue) {
                newValue && element.focus();
            }, true);
    };
});

var mctree = angular.module('mctree', ['materialsCommonsServices', 'stateServices']);
mctree.controller("ProjectTreeController", ["$scope", "mcapi", "Projects", "pubsub",
    function ($scope, mcapi, Projects, pubsub) {
        $scope.model = Projects.model;

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

        $scope.backToFolder = function(item) {
            $scope.dir = item.children;
        };

        $scope.selectProject = function(projectId) {
            console.log("calling selectProject: " + projectId);
            $scope.trail = [];
            $scope.projectId = projectId;
            $scope.tree_data = [];
            $scope.loaded = false;
            if (!(projectId in $scope.model.projects)) {
                mcapi('/projects/%/tree2', projectId)
                    .success(function(data) {
                        console.dir(data);
                        if (data[0]) {
                            $scope.tree_data = data;
                            $scope.dir = $scope.tree_data[0].children;
                            var obj = {};
                            obj.dir = $scope.dir;
                            $scope.model.projects[projectId] = obj;
                            $scope.loaded = true;
                            $scope.trail.push(data[0]);
                        }
                    }).jsonp();
            } else {
                console.log("Project already loaded");
                $scope.loaded = true;
                $scope.dir = $scope.model.projects[projectId].dir;
            }
        };

        $scope.fileSelected = function(entry) {
            entry.selected = !entry.selected;
            var channel = Projects.channel;
            if (channel != null) {
                pubsub.send(channel, entry);
            }

        }

        $scope.selectProject($scope.project);
    }]);
mctree.directive('projectTree', function () {
    return {
        restrict: "E",
        controller: "ProjectTreeController",
        transclude:false,
        link: function($scope, $element, $attrs) {
            //$scope.project = $attrs.project;
            //console.log("link project = " + $scope.project);
        },
        replace: true,
        scope: {
            ngModel: "@",
            project: "@project"
        },
        templateUrl: "templates/projectTree/projectTree.html"
    }
});

