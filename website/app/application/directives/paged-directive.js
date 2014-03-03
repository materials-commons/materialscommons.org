Application.Directives.directive('paged',
    function () {
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