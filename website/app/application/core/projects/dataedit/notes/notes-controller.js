Application.Controllers.controller('projectsDataEditNotes',
    ["$scope", "mcapi",
        function ($scope, mcapi) {

            $scope.get_datafile = function () {
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
            };

            function init() {
                $scope.get_datafile();
            }

            init();
        }]);