Application.Controllers.controller("upperlevelObjectController",
    ["$scope", "watcher", "$injector",function ($scope, watcher, $injector) {

        $scope.validate_slash = function () {
            if ($scope.doc.name.match(/\//)){
                $scope.flag = "No forward slash in sample names"
            }
            else{
                $scope.flag = ''
            }
        }

    }]);
Application.Directives.directive('upperlevelObject',
    function () {
        return {
            restrict: "A",
            controller: "upperlevelObjectController",
            scope: {
                doc: '=',
                edit: '=',
                bk: '=',
                spanB: '='
            },
            templateUrl: 'application/directives/upperlevel-object.html'
        };
    });
