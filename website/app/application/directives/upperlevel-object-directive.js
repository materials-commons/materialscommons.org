Application.Controllers.controller("upperlevelObjectController",
    ["$scope", "watcher", "$injector", "User", "dateGenerate", "mcapi", function ($scope, watcher, $injector, User,dateGenerate, mcapi) {

        $scope.add_notes = function () {
            $scope.doc.notes.push({'message': $scope.bk.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.bk.new_note = "";
        };

        $scope.validateSlash = function () {
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
